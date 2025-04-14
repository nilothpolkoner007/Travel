import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// ==============================
// 🛡️ Middleware: Verify Token
// ==============================
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🚨 No token provided
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('❌ No token provided or invalid format');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⏰ Check token expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      console.error('❌ Token expired');
      return res.status(403).json({ message: 'Forbidden: Token expired' });
    }

    // ✅ Attach user to request
    req.user = decoded;
    console.log('✅ Token Verified:', {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
    });
    next();
  } catch (error) {
    console.error('❌ Invalid or expired token:', error.message);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

// ==============================
// 🔒 Middleware: Verify Admin Access
// ==============================
export const verifyAdmin = (req, res, next) => {
  // 🚨 Check if user is authenticated
  if (!req.user) {
    console.log('Headers received', req.headers);
    console.log('req.user:', req.user); // should not be undefined

    console.error('❌ No user found in request');
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }

  // 🚨 Check if user is an admin
  if (req.user.isAdmin !== true) {
    console.error('❌ Access denied: User is not an admin');
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  console.log('✅ Admin Access Granted:', {
    userId: req.user.userId,
    isAdmin: req.user.isAdmin,
  });
  next();
};
