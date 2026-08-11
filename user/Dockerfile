# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# Inject production API URLs (services are accessed via Nginx reverse proxy on same host)
ENV VITE_USER_SERVICE_URL=/api/users-svc
ENV VITE_BOOK_SERVICE_URL=/api/books-svc
ENV VITE_AI_SERVICE_URL=/api/ai-svc
RUN npm run build

# ── Stage 2: Vite dev server (local Docker only — docker-compose.local.yml) ───
# Runs Vite HMR so ./user/src volume-mount changes reload instantly.
# Port 3000 matches docker-compose.local.yml "3000:3000" port mapping.
FROM node:20-alpine AS local-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]

# ── Stage 3: Nginx (all deployed environments — dev/stage/preprod/prod) ───────
FROM nginx:1.25-alpine AS dev
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
