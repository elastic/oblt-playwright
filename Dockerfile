FROM node:24.6-trixie-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY playwright.config.ts ./
RUN npx -y playwright@1.55.1 install --with-deps
COPY src/ ./src/
COPY tests/ ./tests/

ENTRYPOINT ["npx","playwright"]
CMD ["--help"]
