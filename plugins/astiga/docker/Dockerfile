FROM node:20-alpine

WORKDIR /app
COPY --from=root_context . /app
RUN npm ci

WORKDIR /app/plugins/astiga
COPY . .
RUN npm ci
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
