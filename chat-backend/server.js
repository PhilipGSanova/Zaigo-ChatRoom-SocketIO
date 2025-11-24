require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const { initSocket } = require('./src/socket');

const app = express();
const server = http.createServer(app);

// --- Basic security & parsing ---
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// --- Rate Limiting ---
const limiter = rateLimit({ windowMS: 15 * 60 * 1000, max: 100 })
app.use(limiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => res.send({ ok: true, message: 'Chat backend running' }));

// --- Connect to DB and start server ---
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
});