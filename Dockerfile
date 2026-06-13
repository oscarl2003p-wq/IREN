FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de package
COPY package.json ./
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/

# Instalar todas las dependencias
RUN npm install --legacy-peer-deps

# Copiar código
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

# Build del backend
RUN npm run build -w apps/backend

# Stage de producción
FROM node:22-alpine

WORKDIR /app

# Copiar solo node_modules y archivos compilados
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY package.json ./

# Exponer puerto
EXPOSE 3001

# Environment
ENV NODE_ENV=production

# Start
CMD ["node", "apps/backend/dist/main.js"]
