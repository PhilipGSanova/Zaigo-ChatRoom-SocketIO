FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]