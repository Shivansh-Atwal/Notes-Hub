import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../routes/auth.js';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  // Check if token is blacklisted
  if (tokenBlacklist && tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token expired or user logged out' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default auth; 