import numpy as np
from sklearn.ensemble import IsolationForest


class IsolationForestDetector:
    """
    Isolation Forest anomaly detector.

    Works completely differently from the autoencoder — instead of
    learning to reconstruct normal patterns, it measures how easy it
    is to isolate a data point from the rest. Anomalies are isolated
    in fewer splits than normal points.

    This catches different types of anomalies than the autoencoder,
    especially sudden spikes or outlier values in individual features.
    """

    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self.is_fitted = False

        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
            n_jobs=-1,   # use all CPU cores
        )

    def fit(self, X: np.ndarray):
        """Train the isolation forest on normal data."""
        self.model.fit(X)
        self.is_fitted = True

    def score(self, x: np.ndarray) -> float:
        """
        Returns an anomaly score between 0 and 1.
        Higher = more anomalous.

        sklearn's score_samples returns negative values where more
        negative = more anomalous, so we invert and normalize to [0,1].
        """
        if not self.is_fitted:
            return 0.0
        x_2d = x.reshape(1, -1)
        raw_score = self.model.score_samples(x_2d)[0]
        # raw_score is in roughly [-0.5, 0.5]; invert so higher = worse
        normalized = float(1 - (raw_score + 0.5))
        return max(0.0, min(1.0, normalized))

    def is_anomaly(self, x: np.ndarray) -> bool:
        """Returns True if the model predicts this sample as an anomaly."""
        if not self.is_fitted:
            return False
        x_2d = x.reshape(1, -1)
        prediction = self.model.predict(x_2d)[0]
        return prediction == -1   # sklearn uses -1 for anomalies
