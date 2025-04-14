import express from 'express';
import {
  createTourist,
  getAllTourists,
  updateTourist,
  deleteTourist,
} from '../controllers/agencyController.js';
import { auth, verifyAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
router.get('/', auth, getAllTourists);
// Protected routes
router.get('/', verifyAdmin, getAllTourists);
router.post('/', verifyAdmin, createTourist);
router.put('/:id', verifyAdmin, updateTourist);
router.delete('/:id', verifyAdmin, deleteTourist);

export default router;
