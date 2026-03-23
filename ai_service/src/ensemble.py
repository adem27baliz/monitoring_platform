import numpy as np
from src.autoencoder import AutoencoderDetector
from src.isolation_forest import IsolationForestDetector


class EnsembleDetector:
    """
    Combines the Autoencoder and Isolation Forest into a single
    anomaly decision with a unified confidence score.

    Strategy:
    - Both models produce a score between 0 and 1
    - Final score = weighted average (60% autoencoder, 40% isolation forest)
    - is_anomaly = True only if BOTH models independently flag it
    - Confidence level = LOW / MEDIUM / HIGH based on final score
    """

    AUTOENCODER_WEIGHT = 0.6
    ISOLATION_FOREST_WEIGHT = 0.4

    def __init__(self, ae_threshold: float = 0.05, if_contamination: float = 0.05):
        self.autoencoder = AutoencoderDetector(threshold=ae_threshold)
        self.isolation_forest = IsolationForestDetector(contamination=if_contamination)
        self.is_fitted = False

    def fit(self, X: np.ndarray):
        self.autoencoder.fit(X)
        self.isolation_forest.fit(X)
        self.is_fitted = True
        print(f"[Ensemble] Models trained on {len(X)} samples")
        print(f"[Ensemble] Autoencoder threshold: {self.autoencoder.threshold:.6f}")

    def predict(self, x: np.ndarray, metrics: dict) -> dict:
        ae_score = self.autoencoder.score(x)
        if_score = self.isolation_forest.score(x)

        # Convert numpy bools to Python bools explicitly
        ae_flag = bool(self.autoencoder.is_anomaly(x))
        if_flag = bool(self.isolation_forest.is_anomaly(x))

        ae_score_normalized = min(1.0, ae_score / max(self.autoencoder.threshold * 2, 1e-9))

        final_score = (
            self.AUTOENCODER_WEIGHT * ae_score_normalized +
            self.ISOLATION_FOREST_WEIGHT * if_score
        )
        final_score = round(float(min(1.0, max(0.0, final_score))), 4)

        is_anomaly = ae_flag and if_flag

        confidence = self._confidence_level(final_score, ae_flag, if_flag)

        return {
            "agentId": str(metrics.get("agentId", "unknown")),
            "hostname": str(metrics.get("hostname", "unknown")),
            "timestamp": int(metrics.get("timestamp", 0)),
            "isAnomaly": bool(is_anomaly),
            "confidence": confidence,
            "score": final_score,
            "models": {
                "autoencoder": {
                    "score": round(float(ae_score), 6),
                    "threshold": round(float(self.autoencoder.threshold), 6),
                    "flagged": ae_flag,
                },
                "isolationForest": {
                    "score": round(float(if_score), 4),
                    "flagged": if_flag,
                },
            },
            "metrics": {
                "cpu": float(metrics.get("cpu", {}).get("usagePercent", 0)),
                "memory": float(metrics.get("memory", {}).get("usagePercent", 0)),
                "diskRead": float(metrics.get("disk", {}).get("readBytesPerSec", 0)),
                "diskWrite": float(metrics.get("disk", {}).get("writeBytesPerSec", 0)),
            },
        }

    def _confidence_level(self, score: float, ae_flag: bool, if_flag: bool) -> str:
        both_agree = ae_flag and if_flag
        if both_agree and score >= 0.75:
            return "HIGH"
        if both_agree and score >= 0.5:
            return "MEDIUM"
        if ae_flag or if_flag:
            return "LOW"
        return "NONE"