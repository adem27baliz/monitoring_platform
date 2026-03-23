import os
import signal
import sys
from dotenv import load_dotenv

load_dotenv()

from src.consumer import MetricsConsumer
from src.producer import AnomalyProducer
from src.trainer import Trainer


def main():
    print("[AI Service] Starting anomaly detection service...")

    trainer = Trainer()
    consumer = MetricsConsumer()
    producer = AnomalyProducer()

    running = True

    def shutdown(sig, frame):
        nonlocal running
        print("\n[AI Service] Shutting down...")
        running = False
        consumer.close()
        producer.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    processed = 0
    anomalies = 0

    print("[AI Service] Listening for metrics...")
    print(f"[AI Service] Need {os.getenv('MIN_SAMPLES_TO_TRAIN', '100')} samples before detection starts")

    while running:
        try:
            for message in consumer:
                if not running:
                    break

                metrics = message.value

                # Always buffer the sample for training
                trainer.add_sample(metrics)

                # Run detection once models are ready
                result = trainer.predict(metrics)
                if result:
                    processed += 1

                    if result["isAnomaly"]:
                        anomalies += 1
                        producer.send(result)

                    if processed % 100 == 0:
                        print(
                            f"[AI Service] Processed: {processed} | "
                            f"Anomalies: {anomalies} | "
                            f"Rate: {round(anomalies/processed*100, 2)}%"
                        )
                else:
                    buffered = len(trainer.buffer)
                    needed = int(os.getenv("MIN_SAMPLES_TO_TRAIN", "100"))
                    print(f"[AI Service] Collecting samples... {buffered}/{needed}")

        except Exception as e:
            print(f"[AI Service] Error in main loop: {e}")
            if running:
                import time
                time.sleep(2)


if __name__ == "__main__":
    main()
