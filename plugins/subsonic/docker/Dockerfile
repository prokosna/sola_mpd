FROM node:24.13.0-alpine

RUN corepack enable

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sola_mpd/shared build
RUN pnpm --filter subsonic build

EXPOSE 3001
CMD ["pnpm", "--filter", "subsonic", "start"]
