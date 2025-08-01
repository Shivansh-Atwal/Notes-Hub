import dotenv from 'dotenv';
dotenv.config();
// index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subject.js';
import notesRoutes from './routes/notes.js';
import tradesRoutes from './routes/trade.js'
import pyqRoutes from './routes/pyq.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
// Removed: import RedisStore from 'connect-redis';
// Removed: import { createClient } from 'redis';

const app = express();
const port = process.env.PORT || 3000;
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});
app.use(limiter);

// Replace with your actual frontend deployed URL
const allowedOrigins =process.env.CLIENT_ORIGIN;

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies or authentication
}));

app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Use in-memory session store for development
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 4 * 24 * 60 * 60 * 1000 }
}));

app.use('/auth', authRoutes);
app.use('/subjects', subjectRoutes);
app.use('/notes', notesRoutes);
app.use('/pyqs', pyqRoutes);
app.use('/trades',tradesRoutes);

app.get('/', async (req, res) => {
  try {
    res.send("hello");
  } catch (err) {
    console.error(err);
  }
});

// Global error handler to ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(port, () => console.log("Server running on port 3000"));
