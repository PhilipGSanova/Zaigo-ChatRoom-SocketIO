# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Serve the build using a simple web server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start the frontend server
CMD ["serve", "-s", "dist", "-l", "5173"]
