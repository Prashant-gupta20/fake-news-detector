"""
Model training pipeline for Fake News Detection.
Uses TF-IDF Vectorization combined with Calibrated PassiveAggressive / Logistic Regression
for calibrated probability scoring and maximum hyperplane margin separation.
"""

import os
import json
import re
import string
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import PassiveAggressiveClassifier, LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

import sys
# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)


try:
    from backend.dataset import get_dataset, load_external_csv
except ImportError:
    from dataset import get_dataset, load_external_csv



BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")
MODEL_PATH = os.path.join(MODELS_DIR, "fake_news_model.joblib")
VECTORIZER_PATH = os.path.join(MODELS_DIR, "vectorizer.joblib")


def clean_text(text: str) -> str:
    """Preprocess text: lowercasing, stripping special control characters, normalizing whitespace."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Remove HTML tags
    text = re.sub(r"<.*?>", " ", text)
    # Strip unnecessary punctuation while keeping semantic token boundaries
    text = re.sub(r"[%s]" % re.escape(string.punctuation), " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def train_model(external_csv: str = None, text_col: str = "text", label_col: str = "label"):
    """
    Train TF-IDF vectorizer and classifier, save artifacts, and export evaluation metrics.
    """
    os.makedirs(MODELS_DIR, exist_ok=True)

    print("📊 Loading dataset...")
    if external_csv and os.path.exists(external_csv):
        print(f"Loading external dataset from {external_csv}")
        df = load_external_csv(external_csv, text_col=text_col, label_col=label_col)
    else:
        df = get_dataset()

    print(f"Loaded {len(df)} total samples. Class distribution:\n{df['label'].value_counts().to_dict()}")

    # Preprocessing
    df["clean_text"] = df["full_text"].apply(clean_text)

    X = df["clean_text"]
    y = df["label"].map(lambda x: 1 if x == "FAKE" else 0)  # 1: FAKE, 0: REAL

    # Split: 80% train, 20% test (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training split: {len(X_train)} samples | Testing split: {len(X_test)} samples")

    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
        sublinear_tf=True
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Base Classifier: PassiveAggressiveClassifier
    # Passive-Aggressive algorithms are widely acknowledged in academic literature
    # for large-scale text classification and streaming data.
    base_pac = PassiveAggressiveClassifier(
        max_iter=1000,
        random_state=42,
        C=0.5,
        loss="hinge"
    )

    # Use CalibratedClassifierCV to obtain calibrated posterior probabilities (predict_proba)
    # while preserving PAC decision boundary
    classifier = CalibratedClassifierCV(estimator=base_pac, cv=3)
    classifier.fit(X_train_vec, y_train)

    # Train a baseline Logistic Regression to extract top feature weights for explanation
    log_reg = LogisticRegression(max_iter=1000, random_state=42)
    log_reg.fit(X_train_vec, y_train)

    # Evaluation
    y_pred = classifier.predict(X_test_vec)
    y_prob = classifier.predict_proba(X_test_vec)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))

    cm = confusion_matrix(y_test, y_pred)
    # cm format: [[TN, FP], [FN, TP]]
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    # Extract top indicative features (words) for Fake and Real
    feature_names = vectorizer.get_feature_names_out()
    coef = log_reg.coef_[0]
    top_fake_idx = np.argsort(coef)[-15:][::-1]
    top_real_idx = np.argsort(coef)[:15]

    top_fake_words = [{"word": str(feature_names[i]), "weight": round(float(coef[i]), 4)} for i in top_fake_idx]
    top_real_words = [{"word": str(feature_names[i]), "weight": round(float(-coef[i]), 4)} for i in top_real_idx]

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "confusion_matrix": {
            "true_negatives": tn,   # Real correctly classified
            "false_positives": fp,  # Real misclassified as Fake
            "false_negatives": fn,  # Fake misclassified as Real
            "true_positives": tp    # Fake correctly classified
        },
        "top_fake_indicators": top_fake_words,
        "top_real_indicators": top_real_words,
        "model_architecture": {
            "vectorizer": "TF-IDF (Unigrams + Bigrams, Sublinear TF, 5000 features)",
            "classifier": "Passive-Aggressive Classifier with Calibrated Probability Estimation (CalibratedClassifierCV)",
            "dataset_origin": "Curated Multi-Domain News Benchmark (Science, Health, Geopolitics, Clickbait)"
        }
    }

    # Save artifacts
    joblib.dump(classifier, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("\n✅ Model training complete!")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"Artifacts saved to: {MODELS_DIR}")
    print(f"Metrics saved to: {METRICS_PATH}")
    return metrics


if __name__ == "__main__":
    train_model()
