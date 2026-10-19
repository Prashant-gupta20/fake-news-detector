"""
Hybrid Explainability Engine for Fake News Detection.
Combines machine learning output with deep linguistic heuristics, sensationalism analysis,
source attribution metrics, and optional Gemini LLM semantic reasoning.
"""

import os
import re

# Comprehensive lexicons for heuristic linguistic breakdown
CLICKBAIT_TRIGGERS = [
    r"\byou (won'?t|will not) believe\b",
    r"\bshocking (truth|secret|reveal)\b",
    r"\bdoctors? (are )?stunned\b",
    r"\bthey (don'?t|do not) want you to know\b",
    r"\bmiracle (cure|trick|remedy)\b",
    r"\bbreaking bombshell\b",
    r"\bwake up\b",
    r"\bsecret (cure|formula|ingredient|papyrus|vault)\b",
    r"\bhidden truth\b",
    r"\bconspiracy\b",
    r"\beradicates? (cancer|diabetes|illness)\b",
    r"\b100% (safe|cure|effective|guaranteed)\b",
    r"\bspread this\b",
    r"\bshare before (it'?s|deleted|removed)\b",
    r"\bbanned by\b",
    r"\bmedical cartel\b",
    r"\bbig pharma\b",
    r"\bdeep state\b"
]

CREDIBLE_ATTRIBUTION_MARKERS = [
    r"\baccording to\b",
    r"\bpublished in\b",
    r"\bpeer-reviewed\b",
    r"\bspokesperson\b",
    r"\bresearchers? (at|from)\b",
    r"\bclinical trial\b",
    r"\bjournal of\b",
    r"\buniversity of\b",
    r"\bofficial statement\b",
    r"\bdata shows?\b",
    r"\bstatistical significance\b",
    r"\breuters\b",
    r"\bassociated press\b",
    r"\bworld health organization\b",
    r"\bnasa\b",
    r"\bdepartment of\b"
]

VAGUE_ANONYMOUS_AUTHORITIES = [
    r"\binsiders? say\b",
    r"\banonymous source\b",
    r"\brogue (doctors?|monks?|chemists?)\b",
    r"\bbrave whistleblower\b",
    r"\bexperts? claim\b",
    r"\bunderground clinic\b",
    r"\btop secret memo\b",
    r"\bconfidential leak\b"
]


def extract_linguistic_signals(text: str) -> dict:
    """Extracts qualitative and quantitative linguistic indicators from text."""
    total_chars = len(text)
    words = text.split()
    total_words = len(words) if words else 1

    # 1. Punctuation anomalies
    exclamation_count = text.count("!")
    question_count = text.count("?")

    # 2. Uppercase shouting density (words > 2 chars fully capitalized, excluding standard acronyms)
    common_acronyms = {"NASA", "WHO", "USA", "CISA", "USGS", "TSMC", "UN", "COVID", "AI", "EU", "ATM", "RFID"}
    uppercase_words = [w for w in words if len(w) > 2 and w.isupper() and w not in common_acronyms]
    shouting_ratio = round((len(uppercase_words) / total_words) * 100, 1)

    # 3. Clickbait & sensationalism triggers
    detected_sensationalism = []
    text_lower = text.lower()
    for pattern in CLICKBAIT_TRIGGERS:
        matches = re.findall(pattern, text_lower)
        if matches:
            detected_sensationalism.append(pattern.replace(r"\b", "").replace(r"\?", "?").replace(r"\\", ""))

    # 4. Source attribution checks
    detected_attributions = []
    for pattern in CREDIBLE_ATTRIBUTION_MARKERS:
        matches = re.findall(pattern, text_lower)
        if matches:
            detected_attributions.append(pattern.replace(r"\b", ""))

    detected_vague_sources = []
    for pattern in VAGUE_ANONYMOUS_AUTHORITIES:
        matches = re.findall(pattern, text_lower)
        if matches:
            detected_vague_sources.append(pattern.replace(r"\b", ""))

    # Composite Sensationalism Score (0 - 100)
    sensationalism_score = min(
        100,
        int(
            len(detected_sensationalism) * 22
            + min(exclamation_count * 10, 30)
            + min(shouting_ratio * 1.5, 25)
            + (len(detected_vague_sources) * 15)
        )
    )

    # Composite Credibility Attribution Score (0 - 100)
    attribution_score = min(
        100,
        int(
            len(detected_attributions) * 25
            + max(0, 30 - (len(detected_vague_sources) * 15))
            + (20 if exclamation_count == 0 else 0)
        )
    )

    return {
        "sensationalism_score": sensationalism_score,
        "attribution_score": attribution_score,
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "shouting_words_count": len(uppercase_words),
        "shouting_ratio_percent": shouting_ratio,
        "detected_sensational_phrases": detected_sensationalism[:5],
        "credible_sources_detected": detected_attributions[:5],
        "vague_sources_detected": detected_vague_sources[:5],
    }


def generate_hybrid_explanation(ml_result: dict, signals: dict, title: str, text: str) -> dict:
    """
    Synthesizes ML predictions with linguistic heuristics and produces a clear,
    professional explanation of why an article was classified as REAL or FAKE.
    Also supports Gemini API call if GEMINI_API_KEY is configured.
    """
    label = ml_result.get("label", "UNCERTAIN")
    confidence = ml_result.get("confidence", 50.0)
    sens_score = signals["sensationalism_score"]
    attr_score = signals["attribution_score"]

    # Check for optional Gemini API key
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = (
                f"You are a professional fact-checker. An automated machine learning model flagged this article as "
                f"'{label}' with {confidence}% confidence.\n\n"
                f"Article Title: {title}\n"
                f"Article Excerpt: {text[:600]}\n\n"
                f"Provide a concise 3-bullet analysis explaining: 1) Key red flags or authenticity markers, "
                f"2) Verifiability of the claims, and 3) Recommendations for the reader."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return {
                    "provider": "Gemini AI + ML Hybrid",
                    "summary": response.text.strip(),
                    "key_signals": signals,
                    "actionable_checklist": [
                        "Cross-verify claims with reputable wire services (Reuters, AP, BBC).",
                        "Check the official author biography and institutional affiliations.",
                        "Inspect primary source scientific papers in recognized indexes (e.g., PubMed, IEEE)."
                    ]
                }
        except Exception as e:
            # Fallback gracefully to built-in reasoning engine
            pass

    # Built-in deterministic explainability engine (college viva & offline ready)
    rationale_points = []
    checklist = []

    if label == "FAKE":
        if sens_score >= 40:
            rationale_points.append(
                f"High sensationalism detected ({sens_score}/100). The text employs clickbait patterns and exaggerated claims typical of fabricated reports."
            )
        if signals["shouting_words_count"] > 2 or signals["exclamation_count"] > 1:
            rationale_points.append(
                f"Emotional manipulation tactics present: Identified {signals['shouting_words_count']} capitalized urgency words and {signals['exclamation_count']} exclamation marks."
            )
        if signals["vague_sources_detected"]:
            rationale_points.append(
                f"Reliance on unverified authority: Mentions vague sources like '{signals['vague_sources_detected'][0]}' without naming institutions or verifiable dates."
            )
        if attr_score < 30:
            rationale_points.append(
                "Absence of institutional citations: No peer-reviewed publications, established agencies, or verifiable quotes were identified."
            )
        if not rationale_points:
            rationale_points.append(
                f"TF-IDF lexical profile strongly aligns with historical disinformation clusters with a model confidence of {confidence}%."
            )

        checklist = [
            "Search the headline on Snopes, Reuters Fact Check, or PolitiFact.",
            "Verify whether reputable mainstream publications have reported this claim.",
            "Inspect the domain name for typo-squatting or imitation URLs (e.g. '.co' or '.com.de').",
            "Be wary of calls to immediate action, panic, or unverified medical remedies."
        ]
    else:  # REAL
        if attr_score >= 40:
            rationale_points.append(
                f"Strong attribution structure ({attr_score}/100): Contains explicit references to reputable organizations, researchers, or documented studies."
            )
        if sens_score <= 25:
            rationale_points.append(
                "Neutral journalistic tone: Low sensationalism index, measured vocabulary, and absence of manipulative urgency markers."
            )
        if signals["credible_sources_detected"]:
            rationale_points.append(
                f"Identified concrete attribution markers such as: {', '.join(signals['credible_sources_detected'][:3])}."
            )
        if not rationale_points:
            rationale_points.append(
                f"Lexical distribution and semantic structure match verified journalistic reporting benchmarks ({confidence}% confidence)."
            )

        checklist = [
            "Check primary sources cited in the article for further technical details.",
            "Review updates from the originating organization for follow-up findings.",
            "Confirm that the context is current and has not been misdated or taken out of context."
        ]

    summary_text = (
        f"**Classification Breakdown ({label} - {confidence}% Confidence)**\n\n"
        + "\n".join([f"• {point}" for point in rationale_points])
    )

    return {
        "provider": "Hybrid ML + Linguistic Heuristic Engine",
        "summary": summary_text,
        "rationale_points": rationale_points,
        "key_signals": signals,
        "actionable_checklist": checklist
    }
