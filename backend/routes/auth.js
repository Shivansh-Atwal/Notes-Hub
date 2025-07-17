import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from '../connections/db.js';
import User from '../models/users.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// In-memory token blacklist (for demonstration; use Redis or DB in production)
const tokenBlacklist = new Set();

// Signup route
router.post('/signup', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters.'),
  body('email').matches(/^\d+@sliet\.ac\.in$/).withMessage('Email must be a valid college email (e.g., 2341045@sliet.ac.in).'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one digit.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  // Enforce college email
  if (!/^\d+@sliet\.ac\.in$/.test(email)) {
    return res.status(400).json({ error: 'Email must be a valid college email (e.g., 2341045@sliet.ac.in).' });
  }
  try {
    // Check if user or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User or email already exists.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const newUser = new User({ username, email, password: hashedPassword, role: role || 'student' });
    await newUser.save();
    // Create JWT
    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      message: 'User registered and logged in successfully.',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Login route (email and password only)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one digit.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // Create JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login successful.', user: { username: user.username, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Logout route: blacklist the token
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  tokenBlacklist.add(token);
  res.json({ message: 'Logged out successfully' });
});

// Export the blacklist for use in middleware
export { tokenBlacklist };
export default router;
