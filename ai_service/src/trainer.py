import os
import time
import threading
import numpy as np
import joblib
from collections import deque
from src.preprocessor import Preprocessor, extract_features
from src.ensemble import EnsembleDetector


MIN_SAMPLES = int(os.getenv("MIN_SAMPLES_TO_TRAIN", "100"))
RETRAIN_INTERVAL = int(os.getenv("RETRAIN_INTERVAL_SECONDS", "1800"))
WINDOW_SIZE = int(os.getenv("ROLLING_WINDOW_SIZE", "5000"))
MODEL_DIR = os.getenv("MODEL_DIR", "models/")


class Trainer:
    """
    Manages the full model lifecycle:
    1. Buffers incoming metric samples
    2. Trains models once MIN_SAMPLES is reached
    3. Retrains every RETRAIN_INTERVAL seconds on a rolling window
    4. Persists models to disk so they survive restarts
    """

    def __init__(self):
        self.preprocessor = Preprocessor()
        self.ensemble = EnsembleDetector(
            ae_threshold=float(os.getenv("AUTOENCODER_THRESHOLD", "0.05")),
            if_contamination=float(os.getenv("ISOLATION_FOREST_CONTAMINATION", "0.05")),
        )
        # Rolling buffer of raw feature vectors (not normalized)
        self.buffer = deque(maxlen=WINDOW_SIZE)
        self.is_ready = False
        self._lock = threading.Lock()
        self._last_trained = None

        os.makedirs(MODEL_DIR, exist_ok=True)
        self._try_load_models()

    # ── Public API ────────────────────────────────────────────────────────────

    def add_sample(self, metrics: dict):
        """
        Called for every incoming Kafka message.
        Adds the sample to the buffer and triggers training if needed.
        """
        features = extract_features(metrics)
        with self._lock:
            self.buffer.append(features)
            count = len(self.buffer)

        if not self.is_ready and count >= MIN_SAMPLES:
            print(f"[Trainer] {count} samples collected. Starting initial training...")
            self._train()
        elif self.is_ready and self._should_retrain():
            print("[Trainer] Retraining interval reached. Retraining models...")
            self._train()

    def predict(self, metrics: dict) -> dict | None:
        """
        Returns anomaly prediction for a metrics payload.
        Returns None if models aren't trained yet.
        """
        if not self.is_ready:
            return None

        features = extract_features(metrics)
        with self._lock:
            normalized = self.preprocessor.transform(features.reshape(1, -1))[0]

        return self.ensemble.predict(normalized, metrics)

    # ── Training ──────────────────────────────────────────────────────────────

    def _train(self):
        with self._lock:
            X_raw = np.array(list(self.buffer))

        X = self.preprocessor.fit_transform(X_raw)
        self.ensemble.fit(X)
        self.is_ready = True
        self._last_trained = time.time()

        self._save_models()
        print(f"[Trainer] Training complete. Buffer size: {len(X_raw)}")

    def _should_retrain(self) -> bool:
        if self._last_trained is None:
            return False
        return (time.time() - self._last_trained) >= RETRAIN_INTERVAL

    # ── Persistence ───────────────────────────────────────────────────────────

    def _save_models(self):
        try:
            joblib.dump(self.preprocessor, f"{MODEL_DIR}/preprocessor.pkl")
            joblib.dump(self.ensemble, f"{MODEL_DIR}/ensemble.pkl")
            print(f"[Trainer] Models saved to {MODEL_DIR}")
        except Exception as e:
            print(f"[Trainer] Failed to save models: {e}")

    def _try_load_models(self):
        pre_path = f"{MODEL_DIR}/preprocessor.pkl"
        ens_path = f"{MODEL_DIR}/ensemble.pkl"
        if os.path.exists(pre_path) and os.path.exists(ens_path):
            try:
                self.preprocessor = joblib.load(pre_path)
                self.ensemble = joblib.load(ens_path)
                self.is_ready = True
                print("[Trainer] Loaded existing models from disk")
            except Exception as e:
                print(f"[Trainer] Could not load saved models: {e}")