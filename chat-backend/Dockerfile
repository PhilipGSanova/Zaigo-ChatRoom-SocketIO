# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
