import jwt from 'jsonwebtoken';

// ==============================
// 🛡️ Main Auth Middleware
// ==============================
export const auth = (req, res, next) => {
  const token = extractToken(req);

  // Only log for API requests
  if (req.path.startsWith('/api')) {
    console.log('Auth Middleware: Headers received', req.headers);
    console.log('Extracted Token:', token);
  }

  if (!token) {
    if (req.path.startsWith('/api')) {
      console.log('❌ No token found in headers or cookies.');
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    } else {
      return next(); // Let frontend navigation continue
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (req.path.startsWith('/api')) {
      console.log('✅ Token Decoded Successfully:', decoded);
    }
    next();
  } catch (error) {
    if (req.path.startsWith('/api')) {
      console.error('❌ JWT Error:', error.message);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    } else {
      return next();
    }
  }
};

// ==============================
// 🔒 Verify Admin Access
// ==============================
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only' });
  }

  console.log('Admin Access Granted:', req.user);
  next();
};

// ==============================
// 🟡 Optional Auth Middleware
// ==============================
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('Optional Auth: User authenticated', req.user);
    } else {
      console.log('Optional Auth: No token provided');
    }

    next();
  } catch (error) {
    console.log('Optional Auth: Invalid or expired token');
    next();
  }
};

// ==============================
// 🔎 Extract Token Helper
// ==============================
const extractToken = (req) => {
  return req.cookies?.token || req.headers.authorization?.split(' ')[1];
};
