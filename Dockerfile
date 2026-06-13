FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps
RUN npm run build -w apps/backend

EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "apps/backend/dist/main.js"]

