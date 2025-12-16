FROM node:22-alpine

RUN apk add --no-cache build-base python3

ARG LAINBOW_ENDPOINT
ENV VITE_LAINBOW_ENDPOINT=${LAINBOW_ENDPOINT}

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build:no_types

RUN cp -R packages/frontend/dist packages/backend/dist/public
RUN rm -rf packages/backend/db

EXPOSE 3000
CMD ["pnpm", "start"]
