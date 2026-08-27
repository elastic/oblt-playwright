FROM node:24.6-trixie-slim
RUN apt update && apt install -y curl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY playwright.config.ts ./
RUN ./node_modules/.bin/playwright install --with-deps chromium
COPY src/ ./src/
COPY tests/ ./tests/

ENTRYPOINT ["npx","playwright"]
CMD ["--help"]
