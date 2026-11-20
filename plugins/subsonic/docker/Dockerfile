FROM node:26.13.1-alpine

RUN npm install -g corepack@0.36.0 && corepack enable

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sola_mpd/shared build
RUN pnpm --filter subsonic build

EXPOSE 3001
CMD ["pnpm", "--filter", "subsonic", "start"]
