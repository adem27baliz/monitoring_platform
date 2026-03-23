import numpy as np
from sklearn.preprocessing import StandardScaler


# Fixed feature order — must never change once models are trained
FEATURE_NAMES = [
    "cpu_usage_percent",
    "cpu_user_percent",
    "cpu_system_percent",
    "memory_usage_percent",
    "memory_used_bytes",
    "memory_available_bytes",
    "disk_read_bps",
    "disk_write_bps",
    "disk_transfers_per_sec",
    "network_rx_bps_total",
    "network_tx_bps_total",
    "network_rx_errors_total",
    "network_tx_errors_total",
]


def extract_features(metrics: dict) -> np.ndarray:
    """
    Flattens a raw metrics payload into a fixed-length feature vector.
    Network stats are summed across all interfaces so the vector length
    stays constant regardless of how many interfaces the machine has.
    """
    cpu = metrics.get("cpu", {})
    memory = metrics.get("memory", {})
    disk = metrics.get("disk", {})
    network_list = metrics.get("network", [])

    # Sum network stats across all interfaces
    net_rx_bps = sum(n.get("rxBytesPerSec", 0) for n in network_list)
    net_tx_bps = sum(n.get("txBytesPerSec", 0) for n in network_list)
    net_rx_err = sum(n.get("rxErrors", 0) for n in network_list)
    net_tx_err = sum(n.get("txErrors", 0) for n in network_list)

    features = [
        cpu.get("usagePercent", 0.0),
        cpu.get("userPercent", 0.0),
        cpu.get("systemPercent", 0.0),
        memory.get("usagePercent", 0.0),
        memory.get("usedBytes", 0.0),
        memory.get("availableBytes", 0.0),
        disk.get("readBytesPerSec", 0.0),
        disk.get("writeBytesPerSec", 0.0),
        disk.get("transfersPerSec", 0.0),
        net_rx_bps,
        net_tx_bps,
        net_rx_err,
        net_tx_err,
    ]

    return np.array(features, dtype=np.float64)


class Preprocessor:
    """
    Wraps a StandardScaler so both training and inference use
    identical normalization. Fit once on training data, then
    call transform() on every incoming sample.
    """

    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, X: np.ndarray):
        self.scaler.fit(X)
        self.is_fitted = True

    def transform(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Preprocessor has not been fitted yet.")
        return self.scaler.transform(X)

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        self.is_fitted = True
        return self.scaler.fit_transform(X)
