import json
import os
from kafka import KafkaProducer


TOPIC = os.getenv("KAFKA_TOPIC_ANOMALIES", "anomalies")


class AnomalyProducer:
    """
    Publishes anomaly detection results back to Kafka on the
    'anomalies' topic. The NestJS backend and alerting system
    will consume from this topic.
    """

    def __init__(self):
        brokers = os.getenv("KAFKA_BROKERS", "localhost:9092").split(",")
        self.producer = KafkaProducer(
            bootstrap_servers=brokers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            retries=5,
        )
        print(f"[AnomalyProducer] Connected to {brokers}")

    def send(self, result: dict):
        """Send an anomaly result. Only anomalies are published to reduce noise."""
        if not result.get("isAnomaly"):
            return

        key = result.get("agentId", "unknown")
        self.producer.send(TOPIC, key=key, value=result)
        self.producer.flush()

        print(
            f"[AnomalyProducer] Anomaly published | "
            f"agent: {result['agentId']} | "
            f"score: {result['score']} | "
            f"confidence: {result['confidence']}"
        )

    def close(self):
        self.producer.close()
        print("[AnomalyProducer] Disconnected")
