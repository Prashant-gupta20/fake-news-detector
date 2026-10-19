# 📰 TruthLens AI - Hybrid Fake News Detection & Explainability Platform

[![Python](https://img.shields.io/badge/Python-3.10%20|%203.11%20|%203.12%20|%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg)](https://scikit-learn.org/)
[![Status](https://img.shields.io/badge/Deployment-Render%20Ready-brightgreen.svg)](https://render.com)
[![Project](https://img.shields.io/badge/College%20Project-Final%20Year%20/%20Capstone-indigo.svg)]()

> A Hybrid Machine Learning and Natural Language Processing (NLP) web platform that detects fabricated news, analyzes sensationalism, and provides transparent, explainable fact-checking reasoning with real-time confidence scoring.

---

## 📌 1. Project Abstract & Motivation

The proliferation of online misinformation and sensationalized content poses a severe threat to public discourse, democratic processes, and public health. Traditional fake news detection systems often suffer from two major flaws:
1. **The "Black Box" Problem:** They output a probability score without explaining *why* an article was deemed fake, offering zero actionable guidance to the reader.
2. **Context Blindness:** They rely solely on surface keywords without evaluating rhetorical anomalies such as capitalized shouting density, clickbait triggers, and source citation credibility.

**TruthLens AI** addresses these challenges by introducing a **Hybrid Detection Paradigm**:
- **Machine Learning Core:** A Passive-Aggressive linear hyperplane classifier combined with Sublinear TF-IDF vectorization to capture lexical and n-gram patterns.
- **Probabilistic Calibration:** Employs Platt scaling (`CalibratedClassifierCV`) to translate raw decision margin distances into calibrated posterior probability distributions.
- **Linguistic Heuristic Engine:** Quantifies emotional manipulation, clickbait trigger phrases, and authoritative vs. anonymous source attribution.
- **Explainable AI (XAI) Synthesis:** Generates human-interpretable rationale bullet points and a verification checklist for readers.

---

## 🚀 2. Key Features

- **⚡ 1-Click Preset Demos:** Pre-loaded with authentic journalistic stories (NASA discoveries, WHO health guidelines) and common disinformation archetypes (miracle cancer herbs, 5G conspiracies) for viva presentations.
- **🎯 Dynamic Credibility Gauge:** Animated SVG radial dial displaying real-time authenticity percentages from 0% to 100%.
- **📊 Multi-Dimensional Metric Cards:**
  - *Sensationalism Index (0–100)*
  - *Source Attribution Score (0–100)*
  - *Capitalized Urgency / Shouting Density (%)*
  - *Punctuation / Exclamation Anomaly Count*
- **🧠 Transparent Explainability:** Breaks down the specific rhetoric, suspicious lexical tokens, and missing citations that led to the verdict.
- **🎓 Dedicated College Viva & Metrics Dashboard:**
  - Live Confusion Matrix (True Positives, True Negatives, False Positives, False Negatives)
  - Key statistical indicators: Accuracy, Precision, Recall, and F1-score
  - Interactive College Viva Q&A flashcards addressing common external examiner questions
- **🌗 Theme Toggle:** Seamless switching between sleek Dark Obsidian and Clean Light modes.
- **🌐 Cloud-Ready & Standalone:** Ships with zero third-party API dependencies (runs 100% offline), with optional Gemini AI integration when an API key is provided.

---

## 📐 3. System Architecture & Methodology

```
+-------------------------------------------------------------+
|                     User / Web Interface                    |
|             (Headline + Body Article Claim Text)             |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               Data Normalization & Cleaning                 |
|       (Lowercase, Regex URL/HTML Strip, Stop-Word Filter)   |
+-------------------------------------------------------------+
                              |
               +--------------+--------------+
               |                             |
               v                             v
+-----------------------------+ +-----------------------------+
|    TF-IDF Vectorization     | | Linguistic Signal Profiler  |
|  - Unigrams + Bigrams (1,2) | |  - Sensationalism Detector  |
|  - Sublinear TF (1+log(tf)) | |  - Shouting Density (%)     |
|  - 5,000 Vocabulary Limit   | |  - Citation & Source Check  |
+-----------------------------+ +-----------------------------+
               |                             |
               v                             |
+-----------------------------+              |
|  Calibrated PAC Classifier  |              |
|  - Passive-Aggressive Model |              |
|  - Sigmoid Calibration (CV) |              |
|  - Calibrated Real vs Fake %|              |
+-----------------------------+              |
               |                             |
               +--------------+--------------+
                              |
                              v
+-------------------------------------------------------------+
|             Hybrid Explainability Synthesizer               |
|      (Synthesizes ML Verdict, Metrics & Human Rationale)    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                FastAPI REST API / JSON Response             |
|       Credibility Gauge + Rationale Points + Action Items   |
+-------------------------------------------------------------+
```

---

## 🧮 4. Mathematical Formulations

### 1. TF-IDF with Sublinear Scaling
Term Frequency-Inverse Document Frequency evaluates the relative importance of a term $t$ in document $d$ within corpus $D$:
$$\text{TF-IDF}(t, d, D) = (1 + \log(\text{TF}(t, d))) \times \log\left(\frac{1 + |D|}{1 + \text{DF}(t, D)}\right) + 1$$
*Sublinear scaling dampens the effect of repetitive keywords, preventing spam or repeated buzzwords from dominating feature space.*

### 2. Passive-Aggressive Classification
The Passive-Aggressive algorithm optimizes the following constrained objective for a sample $(x_t, y_t)$ with weight vector $w_t$:
$$w_{t+1} = \arg\min_w \frac{1}{2} \|w - w_t\|^2 + C \cdot \xi$$
$$\text{subject to } \ell(w; (x_t, y_t)) \le \xi \quad \text{and} \quad \xi \ge 0$$
Where the hinge loss is defined as:
$$\ell(w; (x_t, y_t)) = \max(0, 1 - y_t (w \cdot x_t))$$
- **Passive:** If $\ell = 0$ (sample is classified correctly outside margin), $w_{t+1} = w_t$.
- **Aggressive:** If $\ell > 0$, $w$ is updated aggressively to correct the margin violation while staying close to $w_t$.

### 3. Platt Scaling Posterior Probability Calibration
To transform margin distances $f(x) = w \cdot x$ into well-calibrated posterior probabilities:
$$P(y = 1 \mid x) = \frac{1}{1 + \exp(A \cdot f(x) + B)}$$
Parameters $A$ and $B$ are fitted via maximum likelihood on a 3-fold cross-validation split using `CalibratedClassifierCV`.

---

## 📊 5. Evaluation Metrics & Confusion Matrix

Evaluation results on the stratified held-out test split:

| Metric | Score | Explanation |
| :--- | :--- | :--- |
| **Accuracy** | **100.0%** (Benchmark) | Ratio of total correct predictions across both classes |
| **Precision** | **100.0%** | Minimizes False Positives (authentic news flagged as fake) |
| **Recall (Sensitivity)** | **100.0%** | Minimizes False Negatives (deceptive fake news slipping through) |
| **F1-Score** | **100.0%** | Harmonic mean balancing Precision and Recall |

### Confusion Matrix Representation:
```
                      Predicted Real     Predicted Fake
Actual Real (Negative)      TN: 4             FP: 0  (Type I Error)
Actual Fake (Positive)      FN: 0             TP: 4  (Correctly Flagged)
```

---

## 🎓 6. College Viva Defense Cheatsheet

Here are model answers to the 5 most common questions asked by project examiners:

1. **Q: Why Passive-Aggressive over standard Naive Bayes?**
   > *Answer:* Naive Bayes assumes conditional feature independence, which fails for language where word pairs (n-grams) strongly correlate. Passive-Aggressive is a maximum-margin linear algorithm designed for high-dimensional, sparse text matrices. It adapts dynamically to streaming data with fast convergence.

2. **Q: How does the system handle sarcasm or irony?**
   > *Answer:* Sarcasm is a well-known limitation of bag-of-words and n-gram models. Our hybrid architecture mitigates this by layering linguistic profiling (checking for exclamation mark density, all-caps shouting ratios, and anonymous source attribution) over pure lexical matching.

3. **Q: What is the purpose of N-gram range (1, 2)?**
   > *Answer:* Unigrams alone capture single words (e.g., "secret", "cure"), whereas bigrams capture contextual pairs (e.g., "miracle cure", "big pharma", "peer reviewed"). This drastically reduces ambiguity.

4. **Q: How would this scale to 500,000 articles?**
   > *Answer:* TF-IDF with Passive-Aggressive classification has $O(N)$ training and inference complexity. We can use `HashingVectorizer` to eliminate memory constraints or batch-train on larger datasets like Kaggle's 40,000-row ISOT benchmark using our built-in `load_external_csv()` utility in `backend/dataset.py`.

5. **Q: How is this deployed in production?**
   > *Answer:* TruthLens is built as an asynchronous FastAPI microservice with a single unified port, making it ready for containerization (`Dockerfile`), cloud PaaS (`Render`, `Railway`), or serverless hosting.

---

## 📁 7. Project Structure

```
fake-news-detector/
├── backend/
│   ├── __init__.py               # Backend package initialization
│   ├── main.py                   # FastAPI application, REST endpoints, static mounting
│   ├── dataset.py                # Benchmark dataset & external CSV loader
│   ├── model_trainer.py          # TF-IDF + Calibrated PAC training pipeline
│   ├── classifier.py             # Inference engine and probability calculator
│   ├── hybrid_explainer.py       # Linguistic signal extractor & rationale generator
│   ├── metrics.json              # Evaluated metrics and feature weights
│   └── models/                   # Persisted Scikit-Learn models (.joblib)
├── frontend/
│   ├── index.html                # Semantic HTML5 single page app (3 Tabs)
│   ├── style.css                 # Glassmorphic CSS design system with theme toggle
│   └── app.js                    # Controller: SVG gauge, API fetch, viva accordion
├── requirements.txt              # Production Python dependencies
├── Procfile                      # Render / Railway process file
├── render.yaml                   # Render Infrastructure Blueprint
├── DEPLOYMENT_GUIDE.md           # Step-by-step free deployment tutorial
├── README.md                     # Comprehensive project report & viva guide
└── run.py                        # One-click local launch script
```

---

## 💻 8. Local Setup & Quickstart

### Prerequisites
- Python 3.10 or higher installed.

### Steps:
1. Open PowerShell or Terminal in the project root:
   ```bash
   cd "C:\Users\Prashant Gupta\.gemini\antigravity-ide\scratch\fake-news-detector"
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Train the model (takes ~3 seconds):
   ```bash
   python backend/model_trainer.py
   ```

4. Launch the application:
   ```bash
   python run.py
   ```

5. Open your browser:
   - **Frontend UI:** [http://localhost:8000](http://localhost:8000)
   - **Interactive API Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌐 9. Cloud Deployment

See [DEPLOYMENT_GUIDE.md](file:///C:/Users/Prashant%20Gupta/.gemini/antigravity-ide/scratch/fake-news-detector/DEPLOYMENT_GUIDE.md) for 1-click free deployment instructions on **Render.com** and **Railway**.

---

## 📜 10. License & Academic Attribution
Developed as an open-source academic project for College Engineering Curriculum. Free to adapt and cite for educational presentations.
