"""
Dataset module for the Fake News Detector.
Includes a curated, balanced benchmark dataset across multiple domains
(Science, Medicine, Geopolitics, Technology, and Clickbait) and utilities
for loading larger external datasets (e.g., Kaggle Fake News / ISOT datasets).
"""

import os
import pandas as pd

# Benchmark dataset combining realistic authentic reporting with common misinformation archetypes
BENCHMARK_DATA = [
    # REAL NEWS SAMPLES
    {
        "title": "NASA James Webb Space Telescope Detects Water Vapor in Habitable Zone Rocky Planet System",
        "text": "Astronomers using NASA's James Webb Space Telescope have identified spectroscopic evidence of water vapor surrounding a rocky exoplanet orbiting within the habitable zone of a red dwarf star. The peer-reviewed study, published in the Astrophysical Journal, analyzed light transmission curves collected during three separate transit observations. Lead researcher Dr. Elena Rostova of the Space Telescope Science Institute noted that while atmospheric composition requires further confirmation, the detection represents a significant milestone in exoplanetary characterization. Independent researchers from Cambridge University verified the observational data using standard spectroscopic calibration pipelines.",
        "label": "REAL"
    },
    {
        "title": "World Health Organization Issues Updated Clinical Guidelines for Seasonal Influenza Management",
        "text": "The World Health Organization (WHO) has released updated clinical management recommendations for seasonal influenza ahead of the upcoming winter surveillance cycle. In an official briefing held in Geneva, epidemiologists highlighted increased efficacy from trivalent vaccine formulations and urged healthcare systems to prioritize high-risk demographics, including immunocompromised individuals and adults over age 65. The guidelines synthesize data from randomized controlled trials conducted across 42 member nations, recommending early antiviral therapy within 48 hours of symptom onset for severe presentations.",
        "label": "REAL"
    },
    {
        "title": "Central Bank Announces Quarter-Point Benchmark Interest Rate Adjustment to Balance Growth",
        "text": "Following a two-day monetary policy committee meeting, the Federal Reserve announced a 25 basis point reduction in its benchmark overnight lending rate. Federal Reserve officials indicated in their quarterly economic summary that moderating headline inflation figures, combined with steady labor market indicators, supported a gradual recalibration of monetary policy. Market indices reacted with modest gains as treasury yields adjusted downward. Economic analysts cited in Reuters reports stated the decision aligns with consensus forecasts among institutional economists.",
        "label": "REAL"
    },
    {
        "title": "European Union Reaches Provisional Agreement on Comprehensive Renewable Energy Grid Standards",
        "text": "European Union negotiators reached a provisional agreement in Brussels on revised grid connectivity standards designed to accelerate cross-border renewable power distribution. Under the agreed framework, member states will coordinate infrastructure upgrades to support dynamic load balancing for offshore wind and solar capacity by 2030. The European Parliament's rapporteur confirmed that the compromise text requires formal endorsement by both the European Council and Parliamentary plenary before entering statutory force.",
        "label": "REAL"
    },
    {
        "title": "Clinical Trial Demonstrates 40 Percent Reduction in Cardiac Recurrence with Combination Therapy",
        "text": "A phase III double-blind clinical trial evaluating a novel lipid-lowering therapeutic agent alongside standard statin therapy demonstrated a 40 percent relative risk reduction in secondary cardiovascular events. Results presented at the American Heart Association Scientific Sessions and simultaneously published in the New England Journal of Medicine followed 14,200 patients across 12 countries over a median duration of four years. Biostatistical audits confirmed statistical significance with a p-value of less than 0.001.",
        "label": "REAL"
    },
    {
        "title": "International Seismic Network Records Magnitude 6.4 Earthquake off Coast of Honshu",
        "text": "The United States Geological Survey (USGS) and the Japan Meteorological Agency reported a magnitude 6.4 earthquake occurring at a depth of 35 kilometers off the eastern coast of Honshu on Tuesday morning. Coastal monitoring buoys registered minor sea level fluctuations, but regional tsunami warning advisories were canceled after wave amplitude remained below threat thresholds. Prefectural disaster management authorities reported no critical infrastructure casualties or structural ruptures at regional nuclear installations.",
        "label": "REAL"
    },
    {
        "title": "Semiconductor Manufacturer Unveils High-Efficiency 2nm Fabrication Process Node",
        "text": "Leading semiconductor fabrication company TSMC revealed test production metrics for its advanced 2-nanometer nanosheet transistor process at an industry investor symposium. Engineering executives reported a 15 percent performance increase and a 30 percent reduction in power consumption compared to existing 3-nanometer designs. Volume commercial production remains scheduled for late next year, with initial output prioritized for mobile and data center processing architectures.",
        "label": "REAL"
    },
    {
        "title": "United Nations Climate Conference Finalizes Global Methane Monitoring Protocol",
        "text": "Delegates representing 115 participating countries concluded negotiations at the UN Climate Summit by adopting a standardized framework for satellite-based methane emission tracking. The protocol establishes an open-access global repository coordinated by the International Energy Agency to cross-validate industrial flaring and agricultural leakage data. Independent environmental audits will provide transparent verification metrics to ensure compliance with voluntary emissions reduction pledges.",
        "label": "REAL"
    },
    {
        "title": "University Research Consortium Develops Biodegradable Polymer Alternative to Single-Use Plastics",
        "text": "Materials scientists from a multinational academic consortium have engineered a plant-derived biopolymer that completely decomposes in marine environments within 180 days without releasing microplastic residue. The peer-reviewed paper in Nature Sustainability detailed mechanical tensile testing demonstrating strength comparable to standard polyethylene. Industrial partners have commenced pilot manufacturing tests to assess commercial packaging scalability.",
        "label": "REAL"
    },
    {
        "title": "Ministry of Transport Approves Automated Transit System for Metropolitan Expansion",
        "text": "Municipal transportation authorities approved the procurement contract for a fully automated, driverless rapid rail line connecting downtown transit hubs with the regional international airport. The procurement followed eighteen months of rigorous safety testing and public consultation. Engineering oversight boards verified that redundant fail-safe braking and fiber-optic signaling protocols meet international transit safety benchmarks.",
        "label": "REAL"
    },
    {
        "title": "Global Agricultural Council Forecasts Stable Wheat Yields Despite Regional Weather Anomalies",
        "text": "The Food and Agriculture Organization (FAO) published its biannual global cereal production report, projecting stable worldwide wheat inventories despite localized drought conditions in specific growing regions. Improved yields in Southern Hemisphere producers offset European shortfall estimates, maintaining global supply balance. The report advised governments to maintain transparent export customs protocols to avoid artificial regional price spikes.",
        "label": "REAL"
    },
    {
        "title": "Cybersecurity Agency Issues Patch Advisory for Critical Zero-Day Vulnerability in Web Servers",
        "text": "The Cybersecurity and Infrastructure Security Agency (CISA) added a newly discovered zero-day remote code execution vulnerability to its Known Exploited Vulnerabilities Catalog. The flaw, assigned CVE-2024-4190, impacts legacy enterprise web application servers. Software maintainers released emergency security updates and urged system administrators to implement immediate perimeter isolation and patch installations.",
        "label": "REAL"
    },

    # FAKE NEWS SAMPLES
    {
        "title": "SHOCKING SECRET: Himalayan Root Cures All Stage-4 Illnesses Overnight But Big Pharma BANNED IT!",
        "text": "YOU WILL NOT BELIEVE WHAT THE GOVERNMENT AND MAINSTREAM MEDIA ARE HIDING FROM YOU! An ancient Himalayan tree bark discovered by rogue monks completely eradicates cancer, diabetes, and heart failure within 24 hours of drinking it as tea! Corrupt doctors and pharmaceutical billionaires have paid millions to keep this miracle discovery buried because it would destroy their trillion-dollar racket! Spread this urgent message to everyone you love before the FBI removes this link forever! One simple teaspoon resets your entire immune system instantly!",
        "label": "FAKE"
    },
    {
        "title": "WHISTLEBLOWER EXPOSES: 5G Cell Towers Are Transmitting Mind-Altering Frequencies Across Major Cities!",
        "text": "A brave anonymous insider has finally leaked confidential blueprints showing that newly erected 5G telecommunication antennas are actually scalar wave transmitters engineered to manipulate human brainwaves and emotional states! According to secret laboratory documents that mainstream fact-checkers won't talk about, exposure to high gigahertz frequencies triggers submissive behavioral patterns in metropolitan populations. Patriots must immediately wrap their routers in aluminum foil to block the harmonic control grid!",
        "label": "FAKE"
    },
    {
        "title": "BREAKING BOMBSHELL: Space Agency Admits Moon Landing Was Filmed in Underground Hollywood Soundstage!",
        "text": "In a stunning confession that has left the world speechless, retired studio technicians have released never-before-seen 35mm film reels proving the Apollo lunar missions were an elaborate cinematic hoax! The whistleblowers revealed that high-ranking officials hired special effects directors to stage zero-gravity hops using piano wires and slow-motion cameras. Share this viral truth now before shadow censors wipe it from the internet!",
        "label": "FAKE"
    },
    {
        "title": "DOCTORS ARE STUNNED: Putting Lemon Slices in Your Socks Sucks Out 100% of Body Toxins While You Sleep!",
        "text": "Forget expensive hospital visits and medical bills! A revolutionary ancient home remedy has top cardiologists in complete panic! Placing organic lemon slices and raw garlic directly against the soles of your feet absorbs every toxic heavy metal and poisonous pathogen directly through your pores by morning. The slices turn black by sunrise, proving the poison has been pulled from your bloodstream! The elite medical establishment is threatening to sue the whistleblower doctor who published this secret!",
        "label": "FAKE"
    },
    {
        "title": "URGENT ALERT: Government Passing Secret Midnight Law to Confiscate All Personal Savings Accounts!",
        "text": "Sources close to the globalist central banking cabal confirm that a clandestine emergency decree will take effect this Friday midnight, freezing all public bank balances and converting personal checking deposits into mandatory state-controlled digital tokens! Insiders urge citizens to immediately withdraw all paper currency from ATMs before banking institutions shut their doors permanently! Don't let your hard-earned life savings vanish overnight!",
        "label": "FAKE"
    },
    {
        "title": "LEAKED REPORT: Drinking Alkaline Boiled Water Completely Neutralizes Radioactivity and Radiation Burns",
        "text": "An underground chemist has exposed the single easiest way to survive radioactive fallout and environmental contamination! Boiling tap water with a pinch of pure baking soda creates quantum alkaline clusters that repair damaged DNA chromosomes within minutes of ingestion. Major scientific journals refused to publish this because the nuclear energy lobby suppressed the findings to sell expensive protective gear! Pass this life-saving survival knowledge to your neighborhood!",
        "label": "FAKE"
    },
    {
        "title": "SCIENTIFIC PROOF: Smart Meters Are Secretly Recording Your Private Bedroom Conversations!",
        "text": "Did you know the digital electric meter installed on the outside of your home contains military-grade microphone receivers? An anonymous electrician revealed that utility corporations have formed a private surveillance partnership with intelligence organizations to monitor domestic dialogue and catalog political opinions in real time. Disconnecting the telemetry wire immediately restores privacy in your household!",
        "label": "FAKE"
    },
    {
        "title": "INCREDIBLE DISCOVERY: 300-Year-Old Giant Human Skeleton Unearthed in Remote Mountain Cavern",
        "text": "Archaeologists working off the record have discovered the 18-foot tall skeletal remains of a giant humanoid race buried in a sacred limestone cave! Smithsonian researchers reportedly arrived with military escorts within two hours, confiscating the photographic evidence and ordering the cave entrance dynamited shut to protect orthodox historical timelines. Here are the leaked photographs they don't want the public to see!",
        "label": "FAKE"
    },
    {
        "title": "EXPLOSIVE REVEAL: Eating Raw Onions Twice a Day Eliminates the Need for Any Future Vaccines",
        "text": "Holistic practitioners are celebrating after an underground clinic proved that the sulfur compounds in raw yellow onions form an impenetrable microscopic shield in the pulmonary tract that destroys every known virus on contact! Big Pharma CEOs are lobbying politicians to make raw onions a restricted medicinal substance before sales of pharmaceutical injections collapse completely. Eat two onions daily to stay 100% immune forever!",
        "label": "FAKE"
    },
    {
        "title": "CLASSIFIED MEMO: Subterranean Weather Machines Caused the Recent Coastal Storm to Disrupt Markets",
        "text": "Top-secret satellite telemetry proves that atmospheric ionospheric heaters were pulsed at maximum kilowatt frequency over the coastline just hours before the unseasonal hurricane made landfall! Weather manipulation engineers reportedly targeted strategic agricultural ports to induce artificial scarcity and spike commodities futures for Wall Street hedge funds. Wake up and see the manipulation happening right before your eyes!",
        "label": "FAKE"
    },
    {
        "title": "MIRACLE METABOLIC TRICK: One Drop of This Kitchen Oil Dissolves 30 Pounds of Belly Fat in 7 Days!",
        "text": "Celebrity dieticians are furious that this zero-cost kitchen ritual was leaked online! Placing three drops of cold-pressed castor oil into your morning black coffee triggers an instant thermogenic fat furnace that melts 5 pounds of stubborn visceral fat every 24 hours without exercise or dieting! Clinical trial documents prove 100% success across 5,000 subjects before the corporate diet industry bribed researchers to shred the paperwork!",
        "label": "FAKE"
    },
    {
        "title": "UNBELIEVABLE: Microchips Discovered Inside Ordinary Grocery Store Salt Shakers",
        "text": "Independent consumer watchdogs testing table salt purchased at discount supermarkets have found microscopic RFID tracking transponders disguised as iodized salt crystals! Whistleblowers claim global retailers are tracking food purchasing frequency and consumer geolocation through dietary ingestion. Test your pantry salt with a neodymium magnet immediately to see the metallic transponders cluster together!",
        "label": "FAKE"
    }
]

# Additional synthetic articles to ensure statistically robust training, n-gram balance, and diverse vocabulary
EXTRA_SYNTHETIC_DATA = [
    # REAL
    {"title": "Renewable Energy Accounts for Record 38 Percent of National Electricity Generation in Q3",
     "text": "According to the national energy administration quarterly report, grid-connected solar and wind power output reached historic peaks during the third quarter. Transmission operators highlighted improved battery storage integration which helped stabilize frequency during peak demand hours without reliance on fossil peaker units. Industry representatives noted that falling equipment costs and federal investment tax credits continue driving capacity deployment.",
     "label": "REAL"},
    {"title": "Autonomous Marine Drone Maps 5,000 Square Kilometers of Uncharted Oceanic Ridge",
     "text": "Oceanographers from the National Oceanic and Atmospheric Administration (NOAA) concluded a two-month deep-sea mapping mission using autonomous underwater survey gliders. The high-resolution multibeam sonar data revealed previously uncataloged hydrothermal vent formations and volcanic seamounts along the mid-Atlantic ridge. All navigational datasets have been submitted to the open bathymetric registry.",
     "label": "REAL"},
    {"title": "Peer-Reviewed Study Identifies Novel Biomarker for Early Detection of Pancreatic Conditions",
     "text": "Researchers at Johns Hopkins University School of Medicine published findings identifying a circulating microRNA cluster that correlates with early-stage pancreatic lesions. The diagnostic sensitivity achieved 88 percent across a multi-center validation cohort of 850 patient plasma samples. Clinical investigators emphasized that prospective longitudinal trials are underway prior to regulatory diagnostic approval.",
     "label": "REAL"},
    {"title": "Global Logistics Coalition Implements Carbon Accounting Standards for Freight Shipping",
     "text": "The International Maritime Organization ratified an updated framework requiring commercial cargo fleets to measure and disclose standardized lifecycle carbon emissions per ton-kilometer. The framework incorporates electronic voyage logging and independent third-party fuel verification to verify compliance with decarbonization trajectories.",
     "label": "REAL"},
    {"title": "Archaeological Excavation in Mediterranean Valley Reveals 3,000-Year-Old Bronze Workshop",
     "text": "A joint archaeological expedition from the University of Athens and the British School confirmed the discovery of an intact late Bronze Age metallurgy workshop. Artifacts recovered include clay smelting crucibles, copper-tin slag residues, and finished agricultural implements. Stratigraphic dating indicates continuous production spanning several centuries.",
     "label": "REAL"},
    {"title": "National Science Foundation Awards Grant for Quantum Error Correction Architecture",
     "text": "A consortium of theoretical physicists and computer engineers received a multi-year research grant to investigate surface code fault-tolerant quantum algorithms. The project aims to reduce physical-to-logical qubit overhead through novel topological encoding. Results will be disseminated through open-access conference publications.",
     "label": "REAL"},
     
    # FAKE
    {"title": "SHOCKING TRUTH: Drinking Silver Water Kills Every Infection and Replaces All Prescriptions!",
     "text": "DON'T LET THE MEDICAL CARTEL KEEP YOU SICK! Colloidal silver nanoparticles create an impenetrable electromagnetic shield inside your lymphatic system that immediately destroys all bacteria and pathogens! Hospital directors are desperate to ban this natural remedy because they cannot patent pure silver. Thousands of cured patients swear by this single teaspoon miracle, but corrupt regulators call it unapproved!",
     "label": "FAKE"},
    {"title": "CONFIRMED: Government Installing Invisible Radio Emitters in Streetlights to Control Public Mobs",
     "text": "An anonymous city contractor came forward with horrifying photographic evidence of concealed microwave pulse generators inside municipal LED lampposts! Insiders say these harmonic emitters can project dizziness and fear directly into protesting crowds. Wake up citizens, the high-tech surveillance state is fully active in your neighborhood right now!",
     "label": "FAKE"},
    {"title": "THEY HID THIS: Ancient Egyptian Hieroglyphs Predict Exact Date the Global Financial System Will Collapse",
     "text": "A decoded hidden papyrus scroll kept locked in private museum vaults reveals that pharaohs predicted the precise month when modern fiat currency will vaporize into thin air! Financial elite billionaires are already buying remote island bunkers while ordinary citizens remain distracted. Read the forbidden prophecy before this website is forced offline!",
     "label": "FAKE"},
    {"title": "REVOLUTIONARY SECRET: Magnet Therapy Aligns Red Blood Cells to Reverse Aging in 30 Days",
     "text": "Are you tired of feeling tired? Wearing this patented magnetic wristband draws polarized magnetic flux into your capillaries, instantly reversing cellular senescence and restoring youthful stamina without medicines! Cosmetic surgeons are threatening lawsuits against our company for revealing the truth! Order today before corporate lobbyists ban magnetic therapy!",
     "label": "FAKE"},
    {"title": "VIRAL BOMBSHELL: Alien Probe Caught on Military Radar Landing in Pacific Ocean",
     "text": "Declassified radar logs obtained through military leaks show an unidentified metallic craft traveling at Mach 40 before making a controlled landing off coastal waters! Eyewitness naval sailors were allegedly forced to sign lifetime non-disclosure agreements under threat of court-martial. Watch the leaked radar replay before the Pentagon scrubs the server!",
     "label": "FAKE"},
    {"title": "MIRACLE HERB CURE: Rare Jungle Berry Eliminates High Blood Pressure and Cures Diabetes in 48 Hours",
     "text": "A miraculous purple berry discovered deep in the Amazon basin cures chronic hypertension and diabetes with a single cup of tea! Greedy pharmaceutical corporations tried to burn down the tribal plantation to safeguard insulin revenues. Doctors are stunned by the miraculous recovery numbers! Click now to read the suppressed report!",
     "label": "FAKE"}
]


def get_dataset():
    """Returns the combined baseline training dataframe."""
    all_data = BENCHMARK_DATA + EXTRA_SYNTHETIC_DATA
    df = pd.DataFrame(all_data)
    # Combined text for vectorization
    df["full_text"] = df["title"] + " " + df["text"]
    return df


def load_external_csv(csv_path: str, text_col: str = "text", label_col: str = "label") -> pd.DataFrame:
    """
    Utility to load external datasets (such as Kaggle ISOT Fake News or WELFake CSV).
    Expects labels to be or map to 'REAL' / 'FAKE' (or 0 / 1).
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"File not found: {csv_path}")

    df = pd.read_csv(csv_path)
    if text_col not in df.columns or label_col not in df.columns:
        raise ValueError(f"Columns {text_col} and {label_col} must exist in {csv_path}")

    # Standardize labels
    df_clean = pd.DataFrame()
    df_clean["full_text"] = df[text_col].astype(str)
    
    # Normalize label column
    labels = df[label_col].astype(str).str.upper().str.strip()
    df_clean["label"] = labels.map(lambda x: "REAL" if x in ["REAL", "TRUE", "1", "1.0"] else "FAKE")
    return df_clean
