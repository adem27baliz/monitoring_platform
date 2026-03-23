import numpy as np
from sklearn.neural_network import MLPRegressor


class AutoencoderDetector:
    """
    Autoencoder built on top of MLPRegressor.

    Architecture: input → 8 → 4 → 8 → input
    The model learns to reconstruct normal metric patterns.
    Anomaly score = mean squared reconstruction error.
    High error means the input pattern is unlike anything seen during training.
    """

    def __init__(self, threshold: float = 0.05):
        self.threshold = threshold
        self.is_fitted = False

        n_features = 13  # matches FEATURE_NAMES in preprocessor.py

        # Encoder compresses to 4 dimensions, decoder expands back
        self.model = MLPRegressor(
            hidden_layer_sizes=(8, 4, 8),
            activation="relu",
            solver="adam",
            max_iter=200,
            random_state=42,
            warm_start=True,   # allows incremental retraining
        )

    def fit(self, X: np.ndarray):
        """Train the autoencoder to reconstruct X."""
        self.model.fit(X, X)
        self.is_fitted = True

        # Compute threshold from training reconstruction errors
        errors = self._reconstruction_errors(X)
        # Set threshold at the 95th percentile of training errors
        self.threshold = float(np.percentile(errors, 95))

    def score(self, x: np.ndarray) -> float:
        """
        Returns a reconstruction error score for a single sample.
        Higher = more anomalous.
        """
        if not self.is_fitted:
            return 0.0
        x_2d = x.reshape(1, -1)
        reconstructed = self.model.predict(x_2d)
        error = float(np.mean((x_2d - reconstructed) ** 2))
        return error

    def is_anomaly(self, x: np.ndarray) -> bool:
        return self.score(x) > self.threshold

    def _reconstruction_errors(self, X: np.ndarray) -> np.ndarray:
        reconstructed = self.model.predict(X)
        return np.mean((X - reconstructed) ** 2, axis=1)
