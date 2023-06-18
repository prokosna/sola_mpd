FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm ./src/proto && mv ./temp_proto ./src/proto
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
