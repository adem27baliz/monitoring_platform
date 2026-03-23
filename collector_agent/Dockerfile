FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src/ ./src/
COPY .env.example .env

# Prometheus metrics port
EXPOSE 9100

CMD ["node", "src/index.js"]
