## Multi-stage Dockerfile for Railway
## Builds the React frontend and serves it via the Node/Express backend in one service.

# -----------------------------
# Frontend build stage
# -----------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install

# Build frontend
COPY frontend ./frontend
RUN cd frontend && npm run build

# -----------------------------
# Backend runtime stage
# -----------------------------
FROM node:20-alpine AS backend

ENV NODE_ENV=production
WORKDIR /app/backend

# Install build tools so better-sqlite3 can compile on Linux
RUN apk add --no-cache python3 make g++

# Install backend dependencies (Linux-native)
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

# Copy backend source (without node_modules) and rebuild better-sqlite3 from source
COPY backend . 
RUN npm rebuild better-sqlite3 --build-from-source

# Copy built frontend into the image so the backend can serve it
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

# Railway will inject PORT; default to 3001 like server.js
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]

