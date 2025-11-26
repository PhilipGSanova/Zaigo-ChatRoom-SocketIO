# Use Node.js LTS for building both frontend and backend
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# ----------------------
# 1️⃣ Build Backend
# ----------------------
COPY chat-backend/package*.json ./chat-backend/
RUN cd chat-backend && npm install

COPY chat-backend/ ./chat-backend/

# ----------------------
# 2️⃣ Build Frontend
# ----------------------
COPY chat-frontend/package*.json ./chat-frontend/
RUN cd chat-frontend && npm install

COPY chat-frontend/ ./chat-frontend/
RUN cd chat-frontend && npm run build

# ----------------------
# 3️⃣ Final container
# ----------------------
FROM node:20-alpine

WORKDIR /app

# Copy backend and frontend build from builder stage
COPY --from=builder /app/chat-backend ./chat-backend
COPY --from=builder /app/chat-frontend/dist ./chat-frontend/dist

# Install production backend dependencies
RUN cd chat-backend && npm install --production

# Expose ports
EXPOSE 5000 5173

# Set environment variables (optional)
ENV PORT=5000
ENV CLIENT_URL=http://localhost:5173

# Start backend
CMD ["node", "chat-backend/server.js"]
