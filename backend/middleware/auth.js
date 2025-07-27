import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../routes/auth.js';

export default function (req, res, next) {
  // First check for session-based authentication
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  
  // Then check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  return res.status(401).json({ error: 'Unauthorized: No valid authentication' });
} 