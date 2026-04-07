FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node scripts/wait-for-db.js && npm run migration:run && npm run start:prod"]
