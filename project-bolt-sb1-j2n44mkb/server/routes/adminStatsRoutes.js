import express from 'express';
import { auth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Mock statistics function (Replace with actual DB queries)
const getStats = async () => {
  return {
    totalUsers: 500,
    totalBookings: 120,
    totalRevenue: 100000,
  };
};

// Protected route for admin stats
router.get('/', auth, verifyAdmin, async (req, res) => {
  try {
    const stats = await getStats(); // Replace with actual DB queries
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
