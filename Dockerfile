# Multi-stage build for Riddle application
# Stage 1: Build frontend and backend
FROM node:22-alpine as builder

WORKDIR /app

# Copy all package files so npm ci can resolve the full workspace
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all workspace dependencies (hoisted to /app/node_modules)
RUN npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build both frontend and backend
RUN npm run build

# Stage 2: Runtime image
FROM node:22-alpine

WORKDIR /app

# Copy package files and hoisted node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/node_modules ./node_modules

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose single port for the backend server (which serves both API and frontend)
EXPOSE 3001

# Start the backend server (it will serve both API and static frontend files)
CMD ["node", "backend/dist/index.js"]
