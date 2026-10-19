/**
 * TruthLens AI - Frontend Controller
 * Handles user interactions, API calls, animated gauge rendering,
 * sample presets, viva preparation, and dynamic theme switching.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const newsForm = document.getElementById("news-form");
  const headlineInput = document.getElementById("headline-input");
  const articleInput = document.getElementById("article-input");
  const charCounter = document.getElementById("char-counter");
  const clearBtn = document.getElementById("clear-btn");
  const submitBtn = document.getElementById("submit-btn");
  const btnContent = submitBtn.querySelector(".btn-content");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");

  // Results Panel Elements
  const resultsPlaceholder = document.getElementById("results-placeholder");
  const resultsContent = document.getElementById("results-content");
  const verdictBanner = document.getElementById("verdict-banner");
  const verdictBadge = document.getElementById("verdict-badge");
  const verdictTitle = document.getElementById("verdict-title");
  const verdictDesc = document.getElementById("verdict-desc");
  const gaugeFill = document.getElementById("gauge-fill");
  const gaugePercent = document.getElementById("gauge-percent");
  const gaugeCaption = document.getElementById("gauge-caption");

  const realProbText = document.getElementById("real-prob-text");
  const fakeProbText = document.getElementById("fake-prob-text");
  const probBarReal = document.getElementById("prob-bar-real");
  const probBarFake = document.getElementById("prob-bar-fake");

  const sensationalismVal = document.getElementById("sensationalism-val");
  const attributionVal = document.getElementById("attribution-val");
  const shoutingVal = document.getElementById("shouting-val");
  const exclamationVal = document.getElementById("exclamation-val");

  const signalsChips = document.getElementById("signals-chips");
  const explanationTitle = document.getElementById("explanation-title");
  const explanationProvider = document.getElementById("explanation-provider");
  const rationaleList = document.getElementById("rationale-list");
  const checklistItems = document.getElementById("checklist-items");
  const copyReportBtn = document.getElementById("copy-report-btn");

  // Tabs & Nav
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const refreshMetricsBtn = document.getElementById("refresh-metrics-btn");

  // Samples Preset
  const sampleChips = document.querySelectorAll(".sample-chip");

  // State
  let currentAnalysis = null;
  let cachedSamples = {};

  // ==========================================
  // 1. Theme Toggle
  // ==========================================
  const savedTheme = localStorage.getItem("truthlens-theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  }

  themeToggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      localStorage.setItem("truthlens-theme", "light");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      localStorage.setItem("truthlens-theme", "dark");
    }
  });

  // ==========================================
  // 2. Navigation Tabs
  // ==========================================
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTabId = tab.getAttribute("data-tab");

      navTabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tabPanes.forEach(pane => pane.classList.remove("active"));

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add("active");
      }

      if (targetTabId === "tab-metrics") {
        fetchModelMetrics();
      }
    });
  });

  // Footer navigation shortcuts
  document.getElementById("footer-viva-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("tab-btn-metrics")?.click();
  });

  document.getElementById("footer-deploy-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("tab-btn-architecture")?.click();
  });

  // ==========================================
  // 3. Word & Character Counter
  // ==========================================
  function updateCounters() {
    const text = articleInput.value.trim();
    const chars = articleInput.value.length;
    const words = text ? text.split(/\s+/).length : 0;
    charCounter.textContent = `${words} words | ${chars} chars`;
  }

  articleInput.addEventListener("input", updateCounters);

  // Clear Button
  clearBtn.addEventListener("click", () => {
    headlineInput.value = "";
    articleInput.value = "";
    updateCounters();
    resultsContent.classList.add("hidden");
    resultsPlaceholder.classList.remove("hidden");
    currentAnalysis = null;
    headlineInput.focus();
  });

  // ==========================================
  // 4. Sample Articles Loader
  // ==========================================
  async function loadSamples() {
    try {
      const res = await fetch("/api/samples");
      if (res.ok) {
        const data = await res.json();
        if (data.samples) {
          data.samples.forEach(s => {
            cachedSamples[s.id] = s;
          });
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote samples, using fallback presets.", err);
    }
  }
  loadSamples();

  sampleChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const sampleType = chip.getAttribute("data-sample-type");
      const sample = cachedSamples[sampleType];
      if (sample) {
        headlineInput.value = sample.title;
        articleInput.value = sample.text;
      } else {
        // Fallback demo texts
        if (sampleType === "real-1") {
          headlineInput.value = "NASA James Webb Space Telescope Detects Water Vapor in Habitable Zone Rocky Planet System";
          articleInput.value = "Astronomers using NASA's James Webb Space Telescope have identified spectroscopic evidence of water vapor surrounding a rocky exoplanet orbiting within the habitable zone of a red dwarf star. The peer-reviewed study, published in the Astrophysical Journal, analyzed light transmission curves collected during three separate transit observations. Lead researcher Dr. Elena Rostova of the Space Telescope Science Institute noted that while atmospheric composition requires further confirmation, the detection represents a significant milestone in exoplanetary characterization.";
        } else if (sampleType === "real-2") {
          headlineInput.value = "World Health Organization Issues Updated Clinical Guidelines for Seasonal Influenza Management";
          articleInput.value = "The World Health Organization (WHO) has released updated clinical management recommendations for seasonal influenza ahead of the upcoming winter surveillance cycle. In an official briefing held in Geneva, epidemiologists highlighted increased efficacy from trivalent vaccine formulations and urged healthcare systems to prioritize high-risk demographics, including immunocompromised individuals and adults over age 65.";
        } else if (sampleType === "fake-1") {
          headlineInput.value = "SHOCKING SECRET: Himalayan Root Cures All Stage-4 Illnesses Overnight But Big Pharma BANNED IT!";
          articleInput.value = "YOU WILL NOT BELIEVE WHAT THE GOVERNMENT AND MAINSTREAM MEDIA ARE HIDING FROM YOU! An ancient Himalayan tree bark discovered by rogue monks completely eradicates cancer, diabetes, and heart failure within 24 hours of drinking it as tea! Corrupt doctors and pharmaceutical billionaires have paid millions to keep this miracle discovery buried because it would destroy their trillion-dollar racket! Spread this urgent message to everyone you love before the FBI removes this link forever!";
        } else if (sampleType === "fake-2") {
          headlineInput.value = "WHISTLEBLOWER EXPOSES: 5G Cell Towers Are Transmitting Mind-Altering Frequencies Across Major Cities!";
          articleInput.value = "A brave anonymous insider has finally leaked confidential blueprints showing that newly erected 5G telecommunication antennas are actually scalar wave transmitters engineered to manipulate human brainwaves and emotional states! According to secret laboratory documents that mainstream fact-checkers won't talk about, exposure to high gigahertz frequencies triggers submissive behavioral patterns in metropolitan populations. Patriots must immediately wrap their routers in aluminum foil!";
        }
      }
      updateCounters();
      // Auto-trigger analysis for seamless demonstration
      newsForm.dispatchEvent(new Event("submit"));
    });
  });

  // ==========================================
  // 5. Submit & Analysis Execution
  // ==========================================
  newsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = headlineInput.value.trim();
    const text = articleInput.value.trim();

    if (!text) {
      alert("Please provide the article text to analyze.");
      articleInput.focus();
      return;
    }

    // Set Loading State
    btnContent.classList.add("hidden");
    btnSpinner.classList.remove("hidden");
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error analyzing article.");
      }

      const result = await response.json();
      currentAnalysis = result;
      renderAnalysisResults(result);

    } catch (error) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      btnContent.classList.remove("hidden");
      btnSpinner.classList.add("hidden");
      submitBtn.disabled = false;
    }
  });

  // ==========================================
  // 6. Results Rendering & Gauge Animation
  // ==========================================
  function renderAnalysisResults(data) {
    resultsPlaceholder.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    const verdict = data.verdict;
    const signals = data.linguistic_metrics;
    const explanation = data.hybrid_explanation;
    const isReal = verdict.label === "REAL";

    // 1. Verdict Banner Style
    verdictBanner.className = `verdict-banner ${isReal ? "real" : "fake"}`;
    verdictBadge.textContent = isReal ? "AUTHENTIC" : "FABRICATED / FAKE";
    verdictTitle.textContent = isReal ? "Likely Authentic News" : "Likely Misinformation / Fake News";
    verdictDesc.textContent = isReal
      ? `Strong credibility signals and neutral journalistic structure (${verdict.confidence}% confidence).`
      : `High sensationalism indicators and manipulative lexical markers detected (${verdict.confidence}% confidence).`;

    // 2. SVG Radial Gauge
    const circumference = 264; // 2 * PI * 42
    const score = isReal ? verdict.real_probability : (100 - verdict.fake_probability);
    const offset = circumference - (circumference * score / 100);

    gaugeFill.style.strokeDashoffset = offset;
    gaugePercent.textContent = `${Math.round(score)}%`;
    gaugeCaption.textContent = "Credibility";

    // 3. Probability Split Bar
    realProbText.textContent = `${verdict.real_probability}%`;
    fakeProbText.textContent = `${verdict.fake_probability}%`;
    probBarReal.style.width = `${verdict.real_probability}%`;
    probBarFake.style.width = `${verdict.fake_probability}%`;

    // 4. Metric Cards
    sensationalismVal.textContent = `${signals.sensationalism_score}/100`;
    attributionVal.textContent = `${signals.attribution_score}/100`;
    shoutingVal.textContent = `${signals.shouting_ratio_percent}%`;
    exclamationVal.textContent = signals.exclamation_count;

    // 5. Signal Chips
    signalsChips.innerHTML = "";
    if (signals.detected_sensational_phrases && signals.detected_sensational_phrases.length > 0) {
      signals.detected_sensational_phrases.forEach(phrase => {
        const chip = document.createElement("span");
        chip.className = "signal-chip danger";
        chip.innerHTML = `⚠️ Trigger: <em>"${phrase}"</em>`;
        signalsChips.appendChild(chip);
      });
    }

    if (signals.vague_sources_detected && signals.vague_sources_detected.length > 0) {
      signals.vague_sources_detected.forEach(source => {
        const chip = document.createElement("span");
        chip.className = "signal-chip danger";
        chip.innerHTML = `❓ Anonymous Claim: <em>"${source}"</em>`;
        signalsChips.appendChild(chip);
      });
    }

    if (signals.credible_sources_detected && signals.credible_sources_detected.length > 0) {
      signals.credible_sources_detected.forEach(source => {
        const chip = document.createElement("span");
        chip.className = "signal-chip success";
        chip.innerHTML = `🏛️ Verified Source: <em>"${source}"</em>`;
        signalsChips.appendChild(chip);
      });
    }

    if (data.lexical_features && data.lexical_features.length > 0) {
      data.lexical_features.slice(0, 4).forEach(item => {
        const chip = document.createElement("span");
        chip.className = "signal-chip";
        chip.style.background = "rgba(255, 255, 255, 0.05)";
        chip.innerHTML = `🔤 TF-IDF Term: <em>"${item.term}"</em> (${item.tfidf})`;
        signalsChips.appendChild(chip);
      });
    }

    // 6. Hybrid Rationale List
    explanationProvider.textContent = explanation.provider || "Hybrid Rule + ML Engine";
    rationaleList.innerHTML = "";
    if (explanation.rationale_points && explanation.rationale_points.length > 0) {
      explanation.rationale_points.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        rationaleList.appendChild(li);
      });
    } else if (explanation.summary) {
      const li = document.createElement("li");
      li.textContent = explanation.summary;
      rationaleList.appendChild(li);
    }

    // 7. Actionable Checklist
    checklistItems.innerHTML = "";
    if (explanation.actionable_checklist) {
      explanation.actionable_checklist.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        checklistItems.appendChild(li);
      });
    }
  }

  // ==========================================
  // 7. Copy Report to Clipboard
  // ==========================================
  copyReportBtn.addEventListener("click", () => {
    if (!currentAnalysis) return;

    const v = currentAnalysis.verdict;
    const m = currentAnalysis.linguistic_metrics;
    const e = currentAnalysis.hybrid_explanation;

    const reportText = `
# TruthLens AI Fact-Checking Report
- Verdict: ${v.label} (${v.confidence}% confidence)
- Real Probability: ${v.real_probability}% | Fake Probability: ${v.fake_probability}%
- Sensationalism Score: ${m.sensationalism_score}/100
- Attribution Score: ${m.attribution_score}/100
- Capitalized Urgency: ${m.shouting_ratio_percent}%

## Rationale Breakdown:
${e.rationale_points ? e.rationale_points.map(p => `- ${p}`).join("\n") : e.summary}

## Recommended Actions:
${e.actionable_checklist ? e.actionable_checklist.map(c => `[ ] ${c}`).join("\n") : "Cross-verify with reputable news wires."}
    `.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      const originalText = copyReportBtn.innerHTML;
      copyReportBtn.innerHTML = `✓ Copied Report!`;
      setTimeout(() => {
        copyReportBtn.innerHTML = originalText;
      }, 2000);
    });
  });

  // ==========================================
  // 8. User Feedback Handler
  // ==========================================
  const feedbackBtns = document.querySelectorAll(".feedback-btn");
  feedbackBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!currentAnalysis) return;
      const vote = btn.getAttribute("data-vote");
      const userLabel = vote === "accurate" ? currentAnalysis.verdict.label : (currentAnalysis.verdict.label === "REAL" ? "FAKE" : "REAL");

      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: headlineInput.value,
            text: articleInput.value,
            predicted_label: currentAnalysis.verdict.label,
            user_label: userLabel
          })
        });
        btn.textContent = "✓ Thanks!";
        btn.disabled = true;
      } catch (err) {
        console.error("Feedback submission error:", err);
      }
    });
  });

  // ==========================================
  // 9. Model Metrics & Viva Accordion
  // ==========================================
  async function fetchModelMetrics() {
    try {
      const res = await fetch("/api/metrics");
      if (!res.ok) return;
      const data = await res.json();
      const m = data.metrics;

      // KPI Scorecards
      document.getElementById("kpi-accuracy").textContent = `${(m.accuracy * 100).toFixed(1)}%`;
      document.getElementById("kpi-precision").textContent = `${(m.precision * 100).toFixed(1)}%`;
      document.getElementById("kpi-recall").textContent = `${(m.recall * 100).toFixed(1)}%`;
      document.getElementById("kpi-f1").textContent = `${(m.f1_score * 100).toFixed(1)}%`;

      // Confusion Matrix
      const cm = m.confusion_matrix;
      document.getElementById("cm-tn").querySelector(".cm-num").textContent = cm.true_negatives;
      document.getElementById("cm-fp").querySelector(".cm-num").textContent = cm.false_positives;
      document.getElementById("cm-fn").querySelector(".cm-num").textContent = cm.false_negatives;
      document.getElementById("cm-tp").querySelector(".cm-num").textContent = cm.true_positives;

      // Feature Weights
      const fakeList = document.getElementById("fake-features-list");
      const realList = document.getElementById("real-features-list");
      fakeList.innerHTML = "";
      realList.innerHTML = "";

      if (m.top_fake_indicators) {
        m.top_fake_indicators.slice(0, 8).forEach(item => {
          const li = document.createElement("li");
          li.className = "feature-pill-item";
          li.innerHTML = `<span>${item.word}</span> <span class="feature-pill-weight">+${item.weight}</span>`;
          fakeList.appendChild(li);
        });
      }

      if (m.top_real_indicators) {
        m.top_real_indicators.slice(0, 8).forEach(item => {
          const li = document.createElement("li");
          li.className = "feature-pill-item";
          li.innerHTML = `<span>${item.word}</span> <span class="feature-pill-weight">+${item.weight}</span>`;
          realList.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Failed to load model metrics:", err);
    }
  }

  refreshMetricsBtn?.addEventListener("click", fetchModelMetrics);

  // Accordion Toggle Logic
  const accordionItems = document.querySelectorAll(".accordion-item");
  accordionItems.forEach(item => {
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close all other items for neat presentation
      accordionItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // Open first accordion item by default
  if (accordionItems.length > 0) {
    accordionItems[0].classList.add("open");
  }
});
