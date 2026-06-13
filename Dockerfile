FROM node:22-alpine

WORKDIR /app

# Copiar raíz
COPY package.json package-lock.json ./

# Copiar backend y tipos compartidos
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

# Instalar dependencias globales
RUN npm install --legacy-peer-deps

# Build backend directamente
RUN cd apps/backend && npm install --legacy-peer-deps && npm run build

# Cleanup para reducir tamaño
RUN rm -rf apps/backend/node_modules apps/backend/src node_modules/.cache

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "apps/backend/dist/main.js"]
