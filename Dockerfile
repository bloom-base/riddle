# Multi-stage build for Riddle application
# Stage 1: Build frontend and backend
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including devDependencies for building)
RUN npm ci --include=dev

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build both frontend and backend
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine

WORKDIR /app

# Copy package files and built artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install only production dependencies for backend
RUN cd backend && npm ci --omit=dev

# Expose backend port
EXPOSE 3001

# Start backend (serves both API and frontend static files)
CMD ["node", "backend/dist/index.js"]
