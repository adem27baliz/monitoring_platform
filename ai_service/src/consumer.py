import json
import os
from kafka import KafkaConsumer


TOPIC = os.getenv("KAFKA_TOPIC_METRICS", "metrics")
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "ai-anomaly-detector")


class MetricsConsumer:
    """
    Consumes raw metrics messages from the Kafka 'metrics' topic.
    Uses a consumer group so multiple AI service instances can
    share the load across Kafka partitions.
    """

    def __init__(self):
        brokers = os.getenv("KAFKA_BROKERS", "localhost:9092").split(",")
        self.consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=brokers,
            group_id=GROUP_ID,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            auto_offset_reset="latest",   # start from newest messages
            enable_auto_commit=True,
            consumer_timeout_ms=1000,     # don't block forever on empty topic
        )
        print(f"[MetricsConsumer] Subscribed to '{TOPIC}' as group '{GROUP_ID}'")

    def __iter__(self):
        """Iterate over incoming messages indefinitely."""
        return iter(self.consumer)

    def close(self):
        self.consumer.close()
        print("[MetricsConsumer] Disconnected")
