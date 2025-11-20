# Use official Node LTS base image (alpine for small size)
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Only copy package manifests first (speeds builds & caches npm install)
COPY package*.json ./

# Install dependencies (use npm ci if package-lock.json exists)
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy app source
COPY . .

# Ensure public folder & server.js are present
# Expose port configured in your app (default 3000)
EXPOSE 3000

# Use non-root 'node' user for security (alpine image includes it)
USER node

# Start the server
CMD ["node", "server.js"]
