FROM node:22-alpine

RUN apk add --no-cache build-base python3

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:no_types

RUN cp -R packages/frontend/dist packages/backend/dist/public
RUN rm -rf packages/backend/db

EXPOSE 3000
CMD ["npm", "start"]
