FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sola_mpd/domain build_ts
RUN pnpm --filter subsonic build

EXPOSE 3001
CMD ["pnpm", "--filter", "subsonic", "start"]
