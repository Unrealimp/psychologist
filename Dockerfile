FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env for Vite
ARG VITE_ADMIN_PASSWORD
ENV VITE_ADMIN_PASSWORD="${VITE_ADMIN_PASSWORD}"

# TEMP DEBUG (уберёшь после успешной проверки)
RUN echo "BUILD VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}"

RUN npm run build


FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# (опционально) если server.js тоже может читать это значение
ARG VITE_ADMIN_PASSWORD
ENV VITE_ADMIN_PASSWORD="${VITE_ADMIN_PASSWORD}"

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
