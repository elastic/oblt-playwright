FROM node:24.6-trixie-slim
RUN apt update && apt install -y curl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY playwright.config.ts ./
RUN ./node_modules/.bin/playwright install --with-deps chromium
COPY src/ ./src/
COPY tests/ ./tests/

# Failure reports link to the source on GitHub. Journeys run from this image
# outside GitHub Actions, where GITHUB_SHA is unset, so the commit is baked in.
ARG GIT_COMMIT=main
ENV GIT_COMMIT=${GIT_COMMIT}

ENTRYPOINT ["npx","playwright"]
CMD ["--help"]
