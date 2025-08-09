FROM node:22-alpine

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run -w packages/domain build_ts

WORKDIR /app/plugins/subsonic
RUN npm ci
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
