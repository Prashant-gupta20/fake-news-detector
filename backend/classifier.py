"""
Classifier inference engine for Fake News Detection.
Loads trained TF-IDF vectorizer and calibrated model, handles text preprocessing,
and provides prediction confidence probabilities.
"""

import os
import joblib
import numpy as np

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)


try:
    from backend.model_trainer import clean_text, train_model, MODEL_PATH, VECTORIZER_PATH
except ImportError:
    from model_trainer import clean_text, train_model, MODEL_PATH, VECTORIZER_PATH



class FakeNewsClassifier:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._ensure_model_loaded()

    def _ensure_model_loaded(self):
        """Loads model and vectorizer from disk, training them if they do not exist yet."""
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
            print("⚙️ Pre-trained model artifacts not found. Initiating baseline training...")
            train_model()

        self.model = joblib.load(MODEL_PATH)
        self.vectorizer = joblib.load(VECTORIZER_PATH)
        print("✅ Fake News Model and Vectorizer successfully loaded.")

    def predict(self, title: str = "", text: str = "") -> dict:
        """
        Predict whether an article is REAL or FAKE.
        Returns prediction label, calibrated confidence, probabilities, and active signal terms.
        """
        combined = f"{title.strip()} {text.strip()}".strip()
        if not combined:
            return {
                "label": "UNCERTAIN",
                "confidence": 0.0,
                "fake_probability": 0.5,
                "real_probability": 0.5,
                "error": "Input text cannot be empty."
            }

        cleaned = clean_text(combined)
        vec = self.vectorizer.transform([cleaned])

        # Calibrated posterior probabilities
        probabilities = self.model.predict_proba(vec)[0]
        # Class 0: REAL, Class 1: FAKE
        real_prob = float(probabilities[0])
        fake_prob = float(probabilities[1])

        # Determine label based on threshold
        if fake_prob >= 0.5:
            label = "FAKE"
            confidence = fake_prob
        else:
            label = "REAL"
            confidence = real_prob

        # Extract active tokens that matched the TF-IDF vocabulary
        feature_names = self.vectorizer.get_feature_names_out()
        nonzero_indices = vec.nonzero()[1]
        active_features = []
        for idx in nonzero_indices:
            term = feature_names[idx]
            tfidf_score = float(vec[0, idx])
            active_features.append({"term": term, "tfidf": round(tfidf_score, 4)})

        # Sort by TF-IDF relevance
        active_features.sort(key=lambda x: x["tfidf"], reverse=True)

        return {
            "label": label,
            "confidence": round(confidence * 100, 2),
            "fake_probability": round(fake_prob * 100, 2),
            "real_probability": round(real_prob * 100, 2),
            "active_features": active_features[:10],
            "word_count": len(combined.split()),
            "character_count": len(combined)
        }


# Singleton instance
classifier_instance = None

def get_classifier() -> FakeNewsClassifier:
    global classifier_instance
    if classifier_instance is None:
        classifier_instance = FakeNewsClassifier()
    return classifier_instance
