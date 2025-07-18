import dotenv from 'dotenv';
dotenv.config();
// index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js';
import tradeRoutes from './routes/trade.js';
import subjectRoutes from './routes/subject.js';
import notesRoutes from './routes/notes.js';
import pyqRoutes from './routes/pyq.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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

app.use('/auth', authRoutes);
app.use('/trades', tradeRoutes);
app.use('/subjects', subjectRoutes);
app.use('/notes', notesRoutes);
app.use('/pyqs', pyqRoutes);

app.get('/', async (req, res) => {
  try {
    res.send("hello");
  } catch (err) {
    console.error(err);
  }
});


app.listen(port, () => console.log("Server running on port 3000"));
