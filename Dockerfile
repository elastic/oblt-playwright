FROM mcr.microsoft.com/playwright:latest

WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY src/ ./src/
COPY tests/ ./tests/
COPY playwright.config.ts ./

ENTRYPOINT ["npx","playwright"]
CMD ["--help"]
