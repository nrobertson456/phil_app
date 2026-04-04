/**
 * Auth middleware: checks for a valid JWT in the Authorization header.
 * If valid, sets req.userId so routes know who is logged in.
 */
import jwt from 'jsonwebtoken';

/** Read at request time so `dotenv.config()` in server.js runs before any auth runs. */
export function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-in-production';
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, jwtSecret());
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
