# 🧠 AI Monitoring & Anomaly Detection Platform

## 🚀 Overview

A full-stack observability platform that monitors system metrics in real time and detects anomalies using machine learning.

This project demonstrates **scalable system design, microservices architecture, and AI integration**.

---

## ✨ Features

* 📊 Real-time system monitoring (CPU, memory, logs)
* ⚡ Event-driven microservices architecture
* 🤖 AI-based anomaly detection (Autoencoder / LSTM)
* 🚨 Smart alerting system (threshold + AI)
* 🔄 Real-time updates via WebSockets
* 🧩 Modular and scalable design

---

## 🏗️ Architecture

The system is built using a distributed architecture:

* **Collector Agents** → gather metrics
* **Message Broker (Kafka / Redis)** → stream data
* **Backend (NestJS Microservices)** → process data
* **Databases** → store metrics & logs
* **AI Service** → detect anomalies
* **Frontend (React)** → visualize data

---

## 🧰 Tech Stack

### Backend

* NestJS (Microservices)
* Kafka
* TimescaleDB


### Frontend

* React
* WebSockets
* Chart.js

### AI

* Python
* SCKITLEARN
* Autoencoder
* ISOLATION FOREST

### DevOps

* Docker
* Prometheus

---

## 🔄 Data Flow

1. Agent collects system metrics
2. Data sent to message broker
3. Backend processes and stores data
4. AI analyzes metrics
5. Anomalies detected → alerts triggered
6. Frontend updates in real time

---

## 🧪 AI Anomaly Detection



* Train on normal system behavior
* Detect anomalies using reconstruction error


---


---


## ⚙️ Setup (Basic)

```bash
# Clone repo
git clone https://github.com/your-username/monitoring-platform

# Run each service
the collector then the ai then the backend then the front end
docker-compose up
```

---

## 📈 Future Improvements

* 🔍 Distributed tracing (Jaeger)
* 🧠 Root cause analysis (AI explanations)
* 📉 Predictive failure detection
* 👥 Multi-tenant support

---

## 🎯 Goal

This project showcases:

* System design at scale
* Real-time data processing
* AI integration in production systems

---

## 👨‍💻 Author

Adem Trabelsi
