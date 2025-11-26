# ---------- Build Stage ----------
FROM node:20 AS builder

# Set working directory inside container
WORKDIR /app

# Copy frontend package.json & package-lock.json from chat-frontend
COPY chat-frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY chat-frontend/ ./

# Build the app
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy built frontend files to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
