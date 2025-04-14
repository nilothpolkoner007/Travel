import express from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { auth, verifyAdmin } from '../middleware/auth.js';
import Transport from '../models/Transport.js';
import Location from '../models/Location.js';

const router = express.Router();

// ✅ GET All Transport Options (with optional location filter)
router.get('/', auth, verifyAdmin, async (req, res) => {
  try {
    const { locationId } = req.query;
    const query = locationId ? { location: locationId } : {};

    const transports = await Transport.find(query).populate('location', 'name country');
    res.status(200).json(transports);
  } catch (error) {
    console.error('❌ Error fetching transports:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST Create New Transport Option
router.post(
  '/',
  auth,
  verifyAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a valid number'),
    body('type')
      .isIn(['bus', 'train', '4wheeler', 'toto', 'taxi', 'bike', 'flight', 'ship', 'boat'])
      .withMessage('Invalid transport type')
      .trim(),
    body('stopage').isArray({ min: 1 }).withMessage('Stopage must be a non-empty array'),
    body('stopage.*').isString().withMessage('Each stopage must be a string'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('location._id')
      .optional()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid location ID');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Validation errors:', errors.array());
      console.log('Incoming request:', req.body);

      return res.status(400).json({ errors: errors.array() });
    }

    const { location, ...data } = req.body;
    const locationId = location._id || location;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    try {
      const transport = new Transport({
        ...data,
        location: locationId, // Keep location ref
        // type is already part of `...data` and validated!
      });

      const savedTransport = await transport.save();

      await Location.findByIdAndUpdate(locationId, {
        $push: { transports: savedTransport._id },
      });

      const populatedTransport = await Transport.findById(savedTransport._id).populate(
        'location',
        'name',
      );

      console.log('✅ New transport added:', populatedTransport?.name || 'Unnamed');
      res.status(201).json(populatedTransport);
    } catch (error) {
      console.error('❌ Error creating transport:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
);


// ✅ PUT Update Transport
router.put('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    const updatedTransport = await Transport.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json(updatedTransport);
  } catch (error) {
    console.error('❌ Error updating transport:', error.message);
    res.status(500).json({ message: 'Error updating transport', error: error.message });
  }
});

// ✅ DELETE Transport
router.delete('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transport deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting transport:', error.message);
    res.status(500).json({ message: 'Error deleting transport', error: error.message });
  }
});

export default router;
