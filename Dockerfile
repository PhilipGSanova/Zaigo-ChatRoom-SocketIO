# ---- Base Node Image ----
FROM node:20

# ---- Create App Directory ----
WORKDIR /app

# ---- Copy monorepo ----
COPY . .

# ---- Install root dependencies ----
RUN npm install

# ---- Install backend dependencies ----
RUN cd chat-backend && npm install

# ---- Install frontend dependencies ----
RUN cd chat-frontend && npm install

# Expose backend + frontend
EXPOSE 5000
EXPOSE 3000

# ---- Start both services ----
CMD ["npm", "start"]
