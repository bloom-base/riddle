# Multi-stage build for Riddle application
# Stage 1: Build frontend and backend
FROM node:20-alpine as builder

WORKDIR /app

# Install backend dependencies and build
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --no-audit --prefer-offline

# Copy backend source and build
COPY backend ./
RUN npm run build

# Install frontend dependencies and build
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --no-audit --prefer-offline

# Copy frontend source and build
COPY frontend ./
RUN npm run build

WORKDIR /app

# Stage 2: Runtime image
FROM node:20-alpine

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
