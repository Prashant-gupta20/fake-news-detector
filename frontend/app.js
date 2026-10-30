/**
 * TruthLens - Professional Editorial Verification Desk Controller
 * Human-Crafted, High-Reliability Frontend Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM References: Inputs & Controls
  const newsForm = document.getElementById("news-form");
  const headlineInput = document.getElementById("headline-input");
  const articleInput = document.getElementById("article-input");
  const charCounter = document.getElementById("char-counter");
  const clearBtn = document.getElementById("clear-btn");
  const pasteBtn = document.getElementById("paste-btn");
  const submitBtn = document.getElementById("submit-btn");
  const btnContent = submitBtn.querySelector(".btn-content");
  const btnSpinner = submitBtn.querySelector(".btn-spinner");

  // Results Dossier Elements
  const resultsPlaceholder = document.getElementById("results-placeholder");
  const resultsContent = document.getElementById("results-content");
  const dossierId = document.getElementById("dossier-id");
  const verdictBanner = document.getElementById("verdict-banner");
  const verdictBadge = document.getElementById("verdict-badge");
  const verdictTitle = document.getElementById("verdict-title");
  const verdictDesc = document.getElementById("verdict-desc");
  const verdictConfidenceBadge = document.getElementById("verdict-confidence-badge");
  const gaugeFill = document.getElementById("gauge-fill");
  const gaugePercent = document.getElementById("gauge-percent");
  const gaugeCaption = document.getElementById("gauge-caption");

  const realProbText = document.getElementById("real-prob-text");
  const fakeProbText = document.getElementById("fake-prob-text");
  const probBarReal = document.getElementById("prob-bar-real");
  const probBarFake = document.getElementById("prob-bar-fake");

  const sensationalismVal = document.getElementById("sensationalism-val");
  const sensationalismTag = document.getElementById("sensationalism-tag");
  const attributionVal = document.getElementById("attribution-val");
  const attributionTag = document.getElementById("attribution-tag");
  const shoutingVal = document.getElementById("shouting-val");
  const exclamationVal = document.getElementById("exclamation-val");

  const signalsChips = document.getElementById("signals-chips");
  const explanationTitle = document.getElementById("explanation-title");
  const explanationProvider = document.getElementById("explanation-provider");
  const rationaleList = document.getElementById("rationale-list");
  const checklistItems = document.getElementById("checklist-items");
  const copyReportBtn = document.getElementById("copy-report-btn");
  const exportJsonBtn = document.getElementById("export-json-btn");

  // Visual Theme
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const sampleChips = document.querySelectorAll(".sample-chip");
  const toastContainer = document.getElementById("toast-container");

  // State
  let currentAnalysis = null;
  let cachedSamples = {};

  // ==========================================
  // Toast Notification System
  // ==========================================
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;

    let iconSvg = "";
    if (type === "success") {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === "error") {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ==========================================
  // 1. Visual Theme Management (Option 5 Mockup)
  // ==========================================
  const themeModePill = document.getElementById("theme-mode-pill");
  const themeModeText = document.getElementById("theme-mode-text");

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      if (themeModeText) themeModeText.textContent = "Light Mode";
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      if (themeModeText) themeModeText.textContent = "Dark Mode";
    }
  }

  const savedTheme = localStorage.getItem("truthlens-theme") || "dark";
  applyTheme(savedTheme);

  function toggleTheme() {
    if (document.body.classList.contains("dark-theme")) {
      applyTheme("light");
      localStorage.setItem("truthlens-theme", "light");
      showToast("Switched to Light Mode", "info");
    } else {
      applyTheme("dark");
      localStorage.setItem("truthlens-theme", "dark");
      showToast("Switched to Dark Mode", "info");
    }
  }

  themeToggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTheme();
  });
  themeModePill?.addEventListener("click", toggleTheme);

  // ==========================================
  // 2. Sidebar Navigation & Multi-View Switcher
  // ==========================================
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav-item");
  const appViews = document.querySelectorAll(".app-view");
  const sidebarHistoryCount = document.getElementById("sidebar-history-count");

  function switchView(targetNav) {
    sidebarNavItems.forEach(item => {
      if (item.getAttribute("data-nav") === targetNav) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    let targetViewId = "view-home";
    if (targetNav === "history") targetViewId = "view-history";
    else if (targetNav === "insights") targetViewId = "view-insights";
    else if (targetNav === "about") targetViewId = "view-about";
    else targetViewId = "view-home";

    appViews.forEach(v => {
      if (v.id === targetViewId) {
        v.classList.remove("hidden");
        v.classList.add("active");
      } else {
        v.classList.add("hidden");
        v.classList.remove("active");
      }
    });

    if (targetNav === "check") {
      articleInput.focus();
    }
    if (targetNav === "history") {
      renderHistory();
    }

    document.getElementById("app-sidebar")?.classList.remove("mobile-open");
  }

  sidebarNavItems.forEach(item => {
    item.addEventListener("click", () => {
      const navTarget = item.getAttribute("data-nav");
      switchView(navTarget);
    });
  });

  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
  mobileSidebarToggle?.addEventListener("click", () => {
    document.getElementById("app-sidebar")?.classList.toggle("mobile-open");
  });

  // Key Analysis Pills Switcher
  const keyPillBtns = document.querySelectorAll(".key-pill-btn");
  const keyPanes = {
    sources: document.getElementById("pill-pane-sources"),
    language: document.getElementById("pill-pane-language"),
    facts: document.getElementById("pill-pane-facts")
  };

  keyPillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const pillKey = btn.getAttribute("data-pill");
      keyPillBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      Object.keys(keyPanes).forEach(k => {
        if (keyPanes[k]) {
          if (k === pillKey) {
            keyPanes[k].classList.remove("hidden");
            keyPanes[k].classList.add("active");
          } else {
            keyPanes[k].classList.add("hidden");
            keyPanes[k].classList.remove("active");
          }
        }
      });
    });
  });


  // ==========================================
  // 3. Editorial Word, Reading Stats & Live Insights
  // ==========================================
  const liveInsightReading = document.getElementById("live-insight-reading");
  const liveReadingText = document.getElementById("live-reading-text");
  const liveInsightWarning = document.getElementById("live-insight-warning");
  const liveWarningText = document.getElementById("live-warning-text");
  const liveInsightSource = document.getElementById("live-insight-source");
  const liveSourceText = document.getElementById("live-source-text");

  const QUICK_TRIGGERS = [
    /\b(shocking|miracle|secret cure|banned by|you won'?t believe|doctors are stunned|conspiracy|deep state|whistleblower exposes|cure all|eradicate cancer)\b/i
  ];
  const QUICK_SOURCES = [
    /\b(according to|published in|peer-reviewed|researchers|university of|reuters|associated press|world health organization|who|nasa)\b/i
  ];

  function updateLiveInsights() {
    const title = headlineInput.value.trim();
    const text = articleInput.value.trim();
    const combined = `${title} ${text}`.trim();

    if (!combined || combined.length < 10) {
      if (liveReadingText) liveReadingText.textContent = "Ready for text input";
      liveInsightWarning?.classList.add("hidden");
      liveInsightSource?.classList.add("hidden");
      return;
    }

    const words = combined.split(/\s+/).filter(Boolean);
    const estMinutes = Math.max(1, Math.ceil(words.length / 220));
    if (liveReadingText) {
      liveReadingText.textContent = `${words.length} words • ~${estMinutes}m read`;
    }

    // Check for urgent capitalization shouting
    const commonAcronyms = new Set(["NASA", "WHO", "USA", "COVID", "CISA", "TSMC", "EU", "UN"]);
    const shoutWords = words.filter(w => w.length > 2 && w === w.toUpperCase() && !commonAcronyms.has(w));
    const hasTrigger = QUICK_TRIGGERS.some(r => r.test(combined));
    const exclamationCount = (combined.match(/!/g) || []).length;

    if (hasTrigger || shoutWords.length >= 2 || exclamationCount >= 2) {
      let warnMsg = "⚠️ ";
      if (hasTrigger && shoutWords.length >= 2) {
        warnMsg += "Clickbait trigger & uppercase shouting flagged";
      } else if (hasTrigger) {
        warnMsg += "Sensational / clickbait triggers flagged";
      } else if (shoutWords.length >= 2) {
        warnMsg += `${shoutWords.length} urgent capitalized words detected`;
      } else {
        warnMsg += `${exclamationCount} exclamation marks detected`;
      }
      if (liveWarningText) liveWarningText.textContent = warnMsg;
      liveInsightWarning?.classList.remove("hidden");
    } else {
      liveInsightWarning?.classList.add("hidden");
    }

    // Check source citations
    const hasSource = QUICK_SOURCES.some(r => r.test(combined));
    if (hasSource) {
      if (liveSourceText) liveSourceText.textContent = "✓ Credible attribution markers found";
      liveInsightSource?.classList.remove("hidden");
    } else {
      liveInsightSource?.classList.add("hidden");
    }
  }

  function updateCounters() {
    const text = articleInput.value.trim();
    const chars = articleInput.value.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const estMinutes = Math.max(1, Math.ceil(words / 220));
    
    if (words > 0) {
      charCounter.textContent = `${words} words • ${chars} chars • ~${estMinutes}m read`;
    } else {
      charCounter.textContent = "0 words • 0 chars";
    }
    updateLiveInsights();
  }

  articleInput.addEventListener("input", updateCounters);
  headlineInput.addEventListener("input", updateLiveInsights);

  // Clear Action
  clearBtn?.addEventListener("click", () => {
    headlineInput.value = "";
    articleInput.value = "";
    updateCounters();
    resultsContent.classList.add("hidden");
    resultsPlaceholder.classList.remove("hidden");
    currentAnalysis = null;
    headlineInput.focus();
    showToast("Editor cleared", "info");});

  // Paste Action
  pasteBtn?.addEventListener("click", async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        articleInput.value = clipText;
        updateCounters();
        showToast("Pasted content from clipboard", "success");
      }
    } catch (err) {
      showToast("Unable to access clipboard. Please use Ctrl+V.", "error");
    }});

  // Keyboard Shortcut: Ctrl/Cmd + Enter to Submit
  articleInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      newsForm.dispatchEvent(new Event("submit"));
    }});

  headlineInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      newsForm.dispatchEvent(new Event("submit"));
    }});

  // ==========================================
  // 4. Curated Benchmark Test Presets & Filter
  // ==========================================
  const fallbackSamples = {
    "real-1": {
      title: "NASA James Webb Space Telescope Detects Water Vapor in Habitable Zone Rocky Planet System",
      text: "Astronomers using NASA's James Webb Space Telescope have identified spectroscopic evidence of water vapor surrounding a rocky exoplanet orbiting within the habitable zone of a red dwarf star. The peer-reviewed study, published in the Astrophysical Journal, analyzed light transmission curves collected during three transit observations. Lead researcher Dr. Elena Rostova noted that independent researchers from Cambridge University verified the observational data using standard spectroscopic calibration pipelines."
    },
    "real-2": {
      title: "World Health Organization Issues Updated Clinical Guidelines for Seasonal Influenza Management",
      text: "The World Health Organization (WHO) has released updated clinical management recommendations for seasonal influenza ahead of the upcoming winter surveillance cycle. In an official briefing held in Geneva, epidemiologists highlighted increased efficacy from trivalent vaccine formulations and urged healthcare systems to prioritize high-risk demographics. The guidelines synthesize data from randomized controlled trials conducted across 42 member nations."
    },
    "real-3": {
      title: "European Union Reaches Provisional Agreement on Comprehensive Renewable Energy Grid Standards",
      text: "European Union negotiators reached a provisional agreement in Brussels on revised grid connectivity standards designed to accelerate cross-border renewable power distribution. Under the agreed framework, member states will coordinate infrastructure upgrades to support dynamic load balancing for offshore wind and solar capacity by 2030."
    },
    "fake-1": {
      title: "SHOCKING SECRET: Himalayan Root Cures All Stage-4 Illnesses Overnight But Big Pharma BANNED IT!",
      text: "YOU WILL NOT BELIEVE WHAT THE GOVERNMENT AND MAINSTREAM MEDIA ARE HIDING FROM YOU! An ancient Himalayan tree bark discovered by rogue monks completely eradicates cancer, diabetes, and heart failure within 24 hours of drinking it as tea! Corrupt doctors and pharmaceutical billionaires have paid millions to keep this miracle discovery buried because it would destroy their trillion-dollar racket! Spread this urgent message to everyone you love before the FBI removes this link forever!"
    },
    "fake-2": {
      title: "WHISTLEBLOWER EXPOSES: 5G Cell Towers Are Transmitting Mind-Altering Frequencies Across Major Cities!",
      text: "A brave anonymous insider has finally leaked confidential blueprints showing that newly erected 5G telecommunication antennas are actually scalar wave transmitters engineered to manipulate human brainwaves and emotional states! According to secret laboratory documents that mainstream fact-checkers won't talk about, exposure to high gigahertz frequencies triggers submissive behavioral patterns in metropolitan populations. Patriots must immediately wrap their routers in aluminum foil!"
    },
    "fake-3": {
      title: "DOCTORS ARE STUNNED: Putting Lemon Slices in Your Socks Sucks Out 100% of Body Toxins While You Sleep!",
      text: "Forget expensive hospital visits and medical bills! A revolutionary ancient home remedy has top cardiologists in complete panic! Placing organic lemon slices and raw garlic directly against the soles of your feet absorbs every toxic heavy metal and poisonous pathogen directly through your pores by morning. The slices turn black by sunrise, proving the poison has been pulled from your bloodstream! The elite medical establishment is threatening lawsuits!"
    }
  };

  async function loadSamples() {
    try {
      const res = await fetch("/api/samples");
      if (res.ok) {
        const data = await res.json();
        if (data.samples) {
          data.samples.forEach(s => {
            cachedSamples[s.id] = s;});
        }
      }
    } catch (err) {
      console.warn("Could not load API sample articles, using local benchmarks.", err);
    }
  }
  loadSamples();

  function triggerSample(sampleId) {
    const sample = cachedSamples[sampleId] || fallbackSamples[sampleId];
    if (sample) {
      headlineInput.value = sample.title;
      articleInput.value = sample.text;
      updateCounters();
      showToast(`Loaded benchmark: ${sample.title.slice(0, 42)}...`, "info");
      newsForm.dispatchEvent(new Event("submit"));
    }
  }

  // Sample Chips Listeners
  const allSampleChips = document.querySelectorAll(".sample-chip");
  allSampleChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const sampleType = chip.getAttribute("data-sample-type");
      triggerSample(sampleType);});});

  // Empty State Clickable Cards
  const clickableSamples = document.querySelectorAll(".clickable-sample");
  clickableSamples.forEach(card => {
    card.addEventListener("click", () => {
      const sampleType = card.getAttribute("data-sample-type");
      triggerSample(sampleType);});
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const sampleType = card.getAttribute("data-sample-type");
        triggerSample(sampleType);
      }});});

  // Sample Filter Buttons
  const sampleFilterBtns = document.querySelectorAll(".sample-filter-btn");
  sampleFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      if (!filter) return;
      sampleFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      allSampleChips.forEach(chip => {
        const cat = chip.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          chip.classList.remove("hidden");
        } else {
          chip.classList.add("hidden");
        }});});});

  // ==========================================
  // Search History Management (localStorage)
  // ==========================================
  const HISTORY_KEY = "truthlens_history_records";
  const historyItemsContainer = document.getElementById("history-items-container");
  const historyCountBadge = document.getElementById("history-count");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  function getHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function renderHistory() {
    const list = getHistory();
    if (historyCountBadge) historyCountBadge.textContent = list.length;
    if (sidebarHistoryCount) sidebarHistoryCount.textContent = list.length;
    if (!historyItemsContainer) return;

    if (list.length === 0) {
      historyItemsContainer.innerHTML = `
        <div class="history-empty" id="history-empty-state">
          <p>No search history yet. News you check will appear here.</p>
        </div>
      `;
      return;
    }

    historyItemsContainer.innerHTML = "";
    list.forEach(item => {
      const card = document.createElement("div");
      const isReal = item.label === "REAL";
      card.className = `history-card ${isReal ? "is-real" : "is-fake"}`;

      const displayTitle = item.title || (item.text ? item.text.slice(0, 48) + "..." : "Untitled News");

      card.innerHTML = `
        <div class="history-card-top">
          <span class="history-pill ${isReal ? "pill-real" : "pill-fake"}">
            ${isReal ? "REAL" : "FAKE"} ${Math.round(item.confidence)}%
          </span>
          <span class="history-time">${item.timestamp}</span>
        </div>
        <div class="history-title" title="${item.title || ""}">
          ${displayTitle}
        </div>
        <div class="history-card-actions">
          <button type="button" class="history-open-btn" title="View this check again">
            Open
          </button>
          <button type="button" class="history-delete-btn" title="Remove from history">
            &times;
          </button>
        </div>
      `;

      card.querySelector(".history-open-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        headlineInput.value = item.title || "";
        articleInput.value = item.text || "";
        updateCounters();
        currentAnalysis = item.data;
        renderAnalysisResults(item.data, item.title, item.text);
        switchView("home");
        showToast("Reopened previous check", "info");});

      card.addEventListener("click", () => {
        headlineInput.value = item.title || "";
        articleInput.value = item.text || "";
        updateCounters();
        currentAnalysis = item.data;
        renderAnalysisResults(item.data, item.title, item.text);});

      card.querySelector(".history-delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);});

      historyItemsContainer.appendChild(card);});
  }

  function saveHistoryItem(title, text, result) {
    const list = getHistory();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});

    const newEntry = {
      id: Date.now(),
      title: title.trim(),
      text: text.trim(),
      label: result.verdict.label,
      confidence: result.verdict.confidence,
      timestamp: timeStr,
      data: result
    };

    const filtered = list.filter(item => !(item.text === newEntry.text && item.title === newEntry.title));
    filtered.unshift(newEntry);
    const trimmed = filtered.slice(0, 15);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    renderHistory();
  }

  function deleteHistoryItem(id) {
    const list = getHistory().filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    renderHistory();
    showToast("Removed from history", "info");
  }

  clearHistoryBtn?.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast("Search history cleared", "info");});

  // Initial load of history
  renderHistory();

  // Dossier Subview Switcher (Summary Overview vs Word-by-Word Analysis)
  const tabSubviewSummary = document.getElementById("tab-subview-summary");
  const tabSubviewAnnotated = document.getElementById("tab-subview-annotated");
  const subviewSummaryContainer = document.getElementById("subview-summary-container");
  const subviewAnnotatedContainer = document.getElementById("subview-annotated-container");

  tabSubviewSummary?.addEventListener("click", () => {
    tabSubviewSummary.classList.add("active");
    tabSubviewSummary.setAttribute("aria-selected", "true");
    tabSubviewAnnotated?.classList.remove("active");
    tabSubviewAnnotated?.setAttribute("aria-selected", "false");
    subviewSummaryContainer?.classList.remove("hidden");
    subviewAnnotatedContainer?.classList.add("hidden");});

  tabSubviewAnnotated?.addEventListener("click", () => {
    tabSubviewAnnotated.classList.add("active");
    tabSubviewAnnotated.setAttribute("aria-selected", "true");
    tabSubviewSummary?.classList.remove("active");
    tabSubviewSummary?.setAttribute("aria-selected", "false");
    subviewSummaryContainer?.classList.add("hidden");
    subviewAnnotatedContainer?.classList.remove("hidden");});

  // Print Dossier Action
  const printDossierBtn = document.getElementById("print-dossier-btn");
  printDossierBtn?.addEventListener("click", () => {
    if (!currentAnalysis) {
      showToast("Check an article first before printing.", "error");
      return;
    }
    window.print();});

  // ==========================================
  // 5. Verification Pipeline Execution
  // ==========================================
  newsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = headlineInput.value.trim();
    const text = articleInput.value.trim();

    if (!text || text.split(/\s+/).length < 3) {
      showToast("Please enter at least a few sentences to check.", "error");
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
        body: JSON.stringify({ title, text })});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error evaluating article.");
      }

      const result = await response.json();
      currentAnalysis = result;
      renderAnalysisResults(result, title, text);
      saveHistoryItem(title, text, result);
      showToast("News check completed!", "success");

    } catch (error) {
      showToast(`Check failed: ${error.message}`, "error");
    } finally {
      btnContent.classList.remove("hidden");
      btnSpinner.classList.add("hidden");
      submitBtn.disabled = false;
    }});

  // ==========================================
  // 6. Results Rendering
  // ==========================================
  function renderAnalysisResults(data, inputTitle = "", inputText = "") {
    resultsPlaceholder.classList.add("hidden");
    resultsContent.classList.remove("hidden");

    // Default to summary subview on new analysis
    tabSubviewSummary?.click();

    const verdict = data.verdict;
    const signals = data.linguistic_metrics;
    const explanation = data.hybrid_explanation;
    const isReal = verdict.label === "REAL";

    // Random Audit ID
    if (dossierId) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      dossierId.textContent = `TL-${randNum}`;
    }

    // Verdict Banner (Matches Mockup)
    verdictBanner.className = `mockup-verdict-card ${isReal ? "real" : "fake"}`;
    verdictBadge.textContent = isReal ? "REAL NEWS" : "FAKE NEWS";
    verdictConfidenceBadge.textContent = "Confidence";
    verdictTitle.textContent = isReal ? "Real News" : "Fake News";
    verdictDesc.textContent = isReal
      ? "This news source is likely genuine based on our AI analysis."
      : "This news article shows strong signs of misinformation based on our AI analysis.";

    const verdictSvgIcon = document.getElementById("verdict-svg-icon");
    if (verdictSvgIcon) {
      if (isReal) {
        verdictSvgIcon.innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
      } else {
        verdictSvgIcon.innerHTML = `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`;
      }
    }

    // Radial Gauge with Smooth Animation
    const circumference = 264; // 2 * PI * 42
    const score = isReal ? verdict.real_probability : (100 - verdict.fake_probability);
    const targetScore = Math.round(score);

    const startTime = performance.now();
    const duration = 750;

    function animateGauge(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(ease * targetScore);

      gaugePercent.textContent = `${currentVal}%`;
      const offset = circumference - (circumference * (ease * score)) / 100;
      gaugeFill.style.strokeDashoffset = offset;

      if (progress < 1) {
        requestAnimationFrame(animateGauge);
      } else {
        gaugePercent.textContent = `${targetScore}%`;
      }
    }
    requestAnimationFrame(animateGauge);

    gaugeCaption.textContent = "Trust Score";

    // Probability Bars
    realProbText.textContent = `${verdict.real_probability}%`;
    fakeProbText.textContent = `${verdict.fake_probability}%`;
    probBarReal.style.width = `${verdict.real_probability}%`;
    probBarFake.style.width = `${verdict.fake_probability}%`;

    // 4 Diagnostics
    sensationalismVal.textContent = `${signals.sensationalism_score}/100`;
    if (sensationalismTag) {
      sensationalismTag.textContent = signals.sensationalism_score < 25 ? "Low" : (signals.sensationalism_score < 60 ? "Moderate" : "High");
    }

    attributionVal.textContent = `${signals.attribution_score}/100`;
    if (attributionTag) {
      attributionTag.textContent = signals.attribution_score >= 50 ? "Verified" : "Missing";
    }

    shoutingVal.textContent = `${signals.shouting_ratio_percent}%`;
    exclamationVal.textContent = signals.exclamation_count;

    // Extracted Linguistic Indicators
    signalsChips.innerHTML = "";
    if (signals.detected_sensational_phrases && signals.detected_sensational_phrases.length > 0) {
      signals.detected_sensational_phrases.forEach(phrase => {
        const chip = document.createElement("span");
        chip.className = "signal-chip danger";
        chip.innerHTML = `<strong>Clickbait:</strong> "${phrase}"`;
        signalsChips.appendChild(chip);});
    }

    if (signals.vague_sources_detected && signals.vague_sources_detected.length > 0) {
      signals.vague_sources_detected.forEach(source => {
        const chip = document.createElement("span");
        chip.className = "signal-chip danger";
        chip.innerHTML = `<strong>Missing Source:</strong> "${source}"`;
        signalsChips.appendChild(chip);});
    }

    if (signals.credible_sources_detected && signals.credible_sources_detected.length > 0) {
      signals.credible_sources_detected.forEach(source => {
        const chip = document.createElement("span");
        chip.className = "signal-chip success";
        chip.innerHTML = `<strong>Trusted Source:</strong> "${source}"`;
        signalsChips.appendChild(chip);});
    }

    if (data.lexical_features && data.lexical_features.length > 0) {
      data.lexical_features.slice(0, 4).forEach(item => {
        const chip = document.createElement("span");
        chip.className = "signal-chip";
        chip.innerHTML = `<strong>Key Word:</strong> "${item.term}"`;
        signalsChips.appendChild(chip);});
    }

    if (signalsChips.children.length === 0) {
      const chip = document.createElement("span");
      chip.className = "signal-chip";
      chip.textContent = "No extreme emotional wording found";
      signalsChips.appendChild(chip);
    }

    // Rationale Points
    explanationProvider.textContent = "AI + Language Rules";
    rationaleList.innerHTML = "";
    if (explanation.rationale_points && explanation.rationale_points.length > 0) {
      explanation.rationale_points.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        rationaleList.appendChild(li);});
    } else if (explanation.summary) {
      const li = document.createElement("li");
      li.textContent = explanation.summary;
      rationaleList.appendChild(li);
    }

    // Recommended Action Checklist with Interactive Checkboxes
    checklistItems.innerHTML = "";
    if (explanation.actionable_checklist && explanation.actionable_checklist.length > 0) {
      explanation.actionable_checklist.forEach((item, idx) => {
        const li = document.createElement("li");
        li.className = "protocol-item";
        li.innerHTML = `
          <label class="protocol-checkbox-label">
            <input type="checkbox" id="protocol-check-${idx}" class="protocol-checkbox">
            <span class="protocol-text">${item}</span>
          </label>
        `;
        checklistItems.appendChild(li);

        li.querySelector("input").addEventListener("change", (e) => {
          if (e.target.checked) {
            li.classList.add("completed");
            showToast("Step checked!", "info");
          } else {
            li.classList.remove("completed");
          }});});
    }

    // Render In-Text Annotated Inspector
    const currentHeadline = inputTitle || headlineInput.value;
    const currentText = inputText || articleInput.value;
    renderAnnotatedArticle(currentHeadline, currentText, data);
  }

  // ==========================================
  // In-Text Word-by-Word Analysis
  // ==========================================
  function renderAnnotatedArticle(title, text, data) {
    const headlineDisplay = document.getElementById("annotated-headline-display");
    const bodyDisplay = document.getElementById("annotated-body-display");
    const statsBar = document.getElementById("annotated-stats-bar");
    if (!bodyDisplay) return;

    const signals = data.linguistic_metrics;
    const features = data.lexical_features || [];

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    let annotatedText = escapeHtml(text);
    let triggerCount = 0;
    let citationCount = 0;
    let shoutingCount = 0;
    let featureCount = 0;

    // 1. Highlight detected sensational phrases
    if (signals.detected_sensational_phrases && signals.detected_sensational_phrases.length > 0) {
      signals.detected_sensational_phrases.forEach(phrase => {
        try {
          const regex = new RegExp(`(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
          annotatedText = annotatedText.replace(regex, (match) => {
            triggerCount++;
            return `<mark class="hl-mark hl-trigger" title="Clickbait trigger: '${match}'">${match}</mark>`;});
        } catch (e) {}});
    }

    // 2. Highlight vague authorities
    if (signals.vague_sources_detected && signals.vague_sources_detected.length > 0) {
      signals.vague_sources_detected.forEach(vague => {
        try {
          const regex = new RegExp(`(${vague.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
          annotatedText = annotatedText.replace(regex, (match) => {
            triggerCount++;
            return `<mark class="hl-mark hl-trigger" title="Missing or vague source: '${match}'">${match}</mark>`;});
        } catch (e) {}});
    }

    // 3. Highlight credible sources
    if (signals.credible_sources_detected && signals.credible_sources_detected.length > 0) {
      signals.credible_sources_detected.forEach(source => {
        try {
          const regex = new RegExp(`(${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
          annotatedText = annotatedText.replace(regex, (match) => {
            citationCount++;
            return `<mark class="hl-mark hl-citation" title="Trusted Institutional Source: '${match}'">${match}</mark>`;});
        } catch (e) {}});
    }

    // 4. Highlight key predictive tokens
    features.slice(0, 5).forEach(item => {
      if (item.term && item.term.length > 3) {
        try {
          const regex = new RegExp(`\\b(${item.term})\\b`, "gi");
          annotatedText = annotatedText.replace(regex, (match) => {
            if (!match.includes("<mark")) {
              featureCount++;
              return `<mark class="hl-mark hl-tfidf" title="Key word found by AI: '${match}'">${match}</mark>`;
            }
            return match;});
        } catch (e) {}
      }});

    // 5. Highlight shouting uppercase words
    annotatedText = annotatedText.replace(/\b([A-Z]{3,})\b/g, (match, p1, offset, string) => {
      if (["NASA", "WHO", "USA", "COVID", "CISA", "TSMC", "HTML", "FBI", "API"].includes(match)) return match;
      const prefix = string.substring(0, offset);
      const lastOpen = prefix.lastIndexOf("<");
      const lastClose = prefix.lastIndexOf(">");
      if (lastOpen > lastClose) return match;
      shoutingCount++;
      return `<mark class="hl-mark hl-shouting" title="ALL-CAPS Shouting: '${match}'">${match}</mark>`;});

    if (headlineDisplay) {
      headlineDisplay.textContent = title || "No headline entered";
    }
    bodyDisplay.innerHTML = annotatedText;

    if (statsBar) {
      statsBar.innerHTML = `
        <div class="stat-badge"><span class="badge-dot red"></span> <strong>${triggerCount}</strong> Clickbait Triggers</div>
        <div class="stat-badge"><span class="badge-dot orange"></span> <strong>${shoutingCount}</strong> Shouting Words</div>
        <div class="stat-badge"><span class="badge-dot green"></span> <strong>${citationCount}</strong> Trusted Sources</div>
        <div class="stat-badge"><span class="badge-dot blue"></span> <strong>${featureCount}</strong> Key Words</div>
      `;
    }
  }

  // ==========================================
  // 7. Export & Copy Actions
  // ==========================================
  copyReportBtn?.addEventListener("click", () => {
    if (!currentAnalysis) {
      showToast("Check an article first before copying.", "error");
      return;
    }

    const v = currentAnalysis.verdict;
    const m = currentAnalysis.linguistic_metrics;
    const e = currentAnalysis.hybrid_explanation;
    const isReal = v.label === "REAL";

    const reportText = `
TruthLens News Verification Report
---------------------------------------------------------
Result:              ${isReal ? "REAL NEWS" : "FAKE NEWS"} (${v.confidence}% confidence)
Chance of Being Real: ${v.real_probability}%
Chance of Being Fake: ${v.fake_probability}%

Scores:
- Clickbait & Drama:  ${m.sensationalism_score}/100
- Sources & Proof:    ${m.attribution_score}/100
- Capital Letters:    ${m.shouting_ratio_percent}%
- Exclamations:       ${m.exclamation_count}

Why We Think So:
${e.rationale_points ? e.rationale_points.map(p => `• ${p}`).join("\n") : e.summary}

What You Should Do:
${e.actionable_checklist ? e.actionable_checklist.map(c => `[ ] ${c}`).join("\n") : "Double-check with trusted news sources."}
---------------------------------------------------------
Verified with TruthLens
    `.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      showToast("Summary copied to clipboard!", "success");});});

  exportJsonBtn?.addEventListener("click", () => {
    if (!currentAnalysis) {
      showToast("Check an article first before exporting.", "error");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentAnalysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `truthlens-check-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("JSON file saved!", "success");});

  // ==========================================
  // 8. User Accuracy Feedback
  // ==========================================
  const feedbackBtns = document.querySelectorAll(".feedback-btn");
  feedbackBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!currentAnalysis) {
        showToast("Check an article first before voting.", "info");
        return;
      }
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
          })});
        showToast("Thank you for your feedback!", "success");
        btn.disabled = true;
        btn.style.opacity = "0.5";
      } catch (err) {
        showToast("Failed to record feedback.", "error");
      }});});
  // ==========================================
  // 9. User Authentication & Sign In / Register
  // ==========================================
  const openAuthModalBtn = document.getElementById("open-auth-modal-btn");
  const closeAuthModalBtn = document.getElementById("close-auth-modal-btn");
  const authModal = document.getElementById("auth-modal");
  const userProfileBadge = document.getElementById("user-profile-badge");
  const userAvatarInitial = document.getElementById("user-avatar-initial");
  const userDisplayName = document.getElementById("user-display-name");
  const logoutBtn = document.getElementById("logout-btn");

  const tabBtnLogin = document.getElementById("tab-btn-login");
  const tabBtnRegister = document.getElementById("tab-btn-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");

  const regName = document.getElementById("reg-name");
  const regEmail = document.getElementById("reg-email");
  const regPassword = document.getElementById("reg-password");
  const regError = document.getElementById("reg-error");
  const demoLoginBtn = document.getElementById("demo-login-btn");

  function openAuthModal(mode = "login") {
    if (!authModal) return;
    authModal.classList.remove("hidden");
    authModal.setAttribute("aria-hidden", "false");
    switchAuthTab(mode);
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.add("hidden");
    authModal.setAttribute("aria-hidden", "true");
    if (loginError) loginError.classList.add("hidden");
    if (regError) regError.classList.add("hidden");
  }

  function switchAuthTab(mode) {
    if (mode === "login") {
      tabBtnLogin.classList.add("active");
      tabBtnLogin.setAttribute("aria-selected", "true");
      tabBtnRegister.classList.remove("active");
      tabBtnRegister.setAttribute("aria-selected", "false");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      tabBtnRegister.classList.add("active");
      tabBtnRegister.setAttribute("aria-selected", "true");
      tabBtnLogin.classList.remove("active");
      tabBtnLogin.setAttribute("aria-selected", "false");
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  }

  const sidebarUserLabel = document.getElementById("sidebar-user-label");
  const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");

  sidebarLogoutBtn?.addEventListener("click", () => {
    const token = localStorage.getItem("truthlens_auth_token");
    if (token) {
      logoutBtn?.click();
    } else {
      openAuthModal("login");
    }
  });

  function setAuthenticatedUser(user) {
    localStorage.setItem("truthlens_auth_token", user.token);
    localStorage.setItem("truthlens_user_name", user.name);
    if (openAuthModalBtn) { openAuthModalBtn.classList.add("hidden"); openAuthModalBtn.style.display = "none"; }
    if (userProfileBadge) {
      userProfileBadge.classList.remove("hidden"); userProfileBadge.style.display = "inline-flex";
      if (userDisplayName) userDisplayName.textContent = user.name;
      if (userAvatarInitial) userAvatarInitial.textContent = user.name.charAt(0).toUpperCase();
    }
    if (sidebarUserLabel) sidebarUserLabel.textContent = `Log out (${user.name.split(" ")[0]})`;
  }

  function clearAuthenticatedUser() {
    localStorage.removeItem("truthlens_auth_token");
    localStorage.removeItem("truthlens_user_name");
    if (openAuthModalBtn) { openAuthModalBtn.classList.remove("hidden"); openAuthModalBtn.style.display = "inline-flex"; }
    if (userProfileBadge) userProfileBadge.classList.add("hidden"); userProfileBadge.style.display = "none";
    if (sidebarUserLabel) sidebarUserLabel.textContent = "Sign In";
  }

  async function checkAuthSession() {
    const token = localStorage.getItem("truthlens_auth_token");
    if (!token) {
      clearAuthenticatedUser();
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuthenticatedUser({ ...data.user, token });
      } else {
        clearAuthenticatedUser();
      }
    } catch (e) {
      // Offline or network error - keep cached name if present
      const cachedName = localStorage.getItem("truthlens_user_name");
      if (cachedName && userProfileBadge) {
        if (openAuthModalBtn) { openAuthModalBtn.classList.add("hidden"); openAuthModalBtn.style.display = "none"; }
        userProfileBadge.classList.remove("hidden"); userProfileBadge.style.display = "inline-flex";
        if (userDisplayName) userDisplayName.textContent = cachedName;
        if (userAvatarInitial) userAvatarInitial.textContent = cachedName.charAt(0).toUpperCase();
      }
    }
  }

  // Modal event triggers
  openAuthModalBtn?.addEventListener("click", () => openAuthModal("login"));
  closeAuthModalBtn?.addEventListener("click", closeAuthModal);
  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  tabBtnLogin?.addEventListener("click", () => switchAuthTab("login"));
  tabBtnRegister?.addEventListener("click", () => switchAuthTab("register"));

  // Login submission
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        loginError.textContent = data.detail || "Invalid email or password.";
        loginError.classList.remove("hidden");
        return;
      }
      setAuthenticatedUser(data.user);
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}!`, "success");
    } catch (err) {
      loginError.textContent = "Unable to connect to authentication server.";
      loginError.classList.remove("hidden");
    }
  });

  // Register submission
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    regError.classList.add("hidden");
    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        regError.textContent = data.detail || "Registration failed.";
        regError.classList.remove("hidden");
        return;
      }
      setAuthenticatedUser(data.user);
      closeAuthModal();
      showToast(`Account created! Welcome, ${data.user.name}!`, "success");
    } catch (err) {
      regError.textContent = "Unable to connect to authentication server.";
      regError.classList.remove("hidden");
    }
  });

  // Demo 1-Click Login (Pre-seeded Prashant Gupta account)
  demoLoginBtn?.addEventListener("click", async () => {
    loginEmail.value = "prashant@truthlens.ai";
    loginPassword.value = "password123";
    loginForm.dispatchEvent(new Event("submit"));
  });

  // Logout action
  logoutBtn?.addEventListener("click", async () => {
    const token = localStorage.getItem("truthlens_auth_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {}
    }
    clearAuthenticatedUser();
    showToast("Signed out successfully", "info");
  });

  // Check session on load
  checkAuthSession();

});
