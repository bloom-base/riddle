# Multi-stage build for Riddle application
# Stage 1: Build frontend and backend
FROM node:22-alpine as builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install backend dependencies separately (avoids workspace hoisting OOM issues)
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --no-audit --prefer-offline

# Install frontend dependencies separately
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --no-audit --prefer-offline

# Back to root, copy source code, and build
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Build both frontend and backend
RUN npm run build

# Stage 2: Runtime image
FROM node:22-alpine

WORKDIR /app

# Copy backend package files, built artifacts, and its own node_modules
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy frontend built artifacts (served as static files by the backend)
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose single port for the backend server (which serves both API and frontend)
EXPOSE 3001

# Start the backend server (it will serve both API and static frontend files)
CMD ["node", "backend/dist/index.js"]
