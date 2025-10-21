FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
RUN npx playwright install chromium
COPY src/ ./src/
COPY tests/ ./tests/
COPY playwright.config.ts ./


ENTRYPOINT ["npx", "playwright"]
CMD ["--help"]
