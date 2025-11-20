# ChatRoom (Socker.IO + Node.js + Express + Vanilla JS)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) 
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) 
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white) 
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20+%20Commons%20Clause-yellow)](./LICENSE)    
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()

A simple real-time chat application built with __Node.js__, __Express__, __Socket.IO__, and __Vanilla JavaScript__

__Supports__
- 👥 Global Chat
- 🔒 Private 1-to-1 messages
- 🏠 Multiple rooms (join/leave)
- 🌙 Dark/Light theme support
- 📡 Real-time user list & room members
- 💬 Room-specific chat histories
- 🐳 Docker support

## Features
__Real-Time Messaging__
- Global chat for all users
- Private direct messages
- Room-based messaging

__Rooms Support__
- Join any room
- Leave rooms anytime
- Room messages shown only inside that room
- Room members list

__Responsive UI__
- Light & dark mode support
- Clean message UI
- System messages styled differently

__Developer Friendly__
- No database required
- Easy to extend
- Docker-ready

## Project Structure
```bash
ChatRoom/
├─ public/
│  ├─ client.js
│  ├─ index.html
│  └─ style.css
├─ .dockerignore
├─ .gitignore
├─ docker-compose.yml
├─ Dockerfile
├─ package-lock.json
├─ package.json
└─ server.js

```

## Prerequisites
Make sure you have installed
- Nodejs 18+
- npm
- (Optional) Docker Desktop

Check versions:
```bash
node -v
npm -v
```

## Install Dependencies
In the root folder
```bash
npm install
```

## Run the App
Start the Node server:
```bash
node server.js
```
The app runs at http://localhost:3000

Open in multiple browser windows to simulate multiple users

## Run with Docker (Optional)
__Build the Docker image:__
```bash
docker build -t chatroom:latest .
```

__Run the container:__
```bash
docker rum -p 3000:3000 chatroom:latest
```

Open http://localhost:3000

## Deploying
You can easily deploy using
- Render.com
- Railway.com
- Heroku
- VPS (Ubuntu + PM2 + Nginx)
- Docker container on any cloud provider

## License
MIT License + Commons Clause Restriction
Copyright (c) 2025 Philip Gracian Sanova

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify and merge the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

### Commons Clause Restriction
The Software is provided under the MIT License does not include, and the following rights are expressly excluded: the right to sell, publish, distribute, sublicense, or otherwise make the Software available as a service or product for commercial purposes.

### Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVEN SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

