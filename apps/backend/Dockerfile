FROM node:20-alpine

WORKDIR /app

# Copiar package.json del workspace raíz y backend
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared-types/package.json packages/shared-types/

# Instalar dependencias
RUN npm install

# Copiar código del backend
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

# Build
RUN npm run build -w apps/backend

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "apps/backend/dist/main.js"]
