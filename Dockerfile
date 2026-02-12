# Multi-stage build for Riddle application
# Stage 1: Build frontend and backend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build both frontend and backend
RUN npm run build

# Stage 2: Runtime image
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the frontend
RUN npm install -g serve

# Copy package files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose ports
EXPOSE 3000 3001

# Start both frontend and backend
CMD ["sh", "-c", "serve -s frontend/dist -l 3000 & node backend/dist/index.js"]
