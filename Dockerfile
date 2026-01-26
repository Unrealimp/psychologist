# ---------- build ----------
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# ВАЖНО:
# никаких секретов через VITE_* — они попадут в браузерный бандл
RUN npm run build


# ---------- runtime ----------
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
