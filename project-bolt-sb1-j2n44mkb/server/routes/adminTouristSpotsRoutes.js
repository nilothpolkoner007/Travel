import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import TouristSpot from '../models/TouristSpot.js';
import { auth, verifyAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ==============================
// 📍 1. Get All Tourist Spots (Optional Location Filter)
// ==============================
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { locationId } = req.query;
    const query = locationId ? { location: locationId } : {};

    // Fetch all tourist spots and populate location details
    const spots = await TouristSpot.find(query).populate('location', 'name country');

    res.status(200).json(spots);
  } catch (error) {
    console.error('❌ Error fetching tourist spots:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// 🔎 2. Get a Specific Tourist Spot by ID
// ==============================
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid tourist spot ID' });
    }

    const spot = await TouristSpot.findById(id).populate('location', 'name country');

    if (!spot) {
      return res.status(404).json({ message: 'Tourist spot not found' });
    }

    res.status(200).json(spot);
  } catch (error) {
    console.error('❌ Error fetching tourist spot:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// ➕ 3. Add a New Tourist Spot (Admin Only)
// ==============================
router.post(
  '/',
  auth,
  verifyAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('image').isURL().withMessage('Valid image URL is required'),
    body('bestTime').trim().notEmpty().withMessage('Best time is required'),
    body('entryFee').isFloat({ min: 0 }).withMessage('Entry fee must be a valid number'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('coordinates.lat').isFloat().withMessage('Latitude must be a valid number'),
    body('coordinates.lng').isFloat().withMessage('Longitude must be a valid number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure body data only once
    const { location, coordinates, ...data } = req.body;

    // Validate the referenced location ID if needed
    if (!mongoose.Types.ObjectId.isValid(location)) {
      return res.status(400).json({ message: 'Invalid location ID' });
    }

    try {
      // Save the tourist spot directly.
      const spot = new TouristSpot({
        ...data,
        location,
        coordinates: {
          lat: parseFloat(coordinates.lat),
          lng: parseFloat(coordinates.lng),
        },
      });

      await spot.save();

      const populatedSpot = await TouristSpot.findById(spot._id).populate(
        'location',
        'name country',
      );

      console.log('✅ New tourist spot added:', populatedSpot.name);

      // Only one response should be sent:
      res.status(201).json(populatedSpot);
    } catch (error) {
      console.error('❌ Error creating tourist spot:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
);




// ==============================
// ✏️ Update a Location (Admin Only)
// ==============================
router.put('/:id', auth, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn('❌ Invalid location ID:', id);
    return res.status(400).json({ message: 'Invalid location ID' });
  }

  try {
    const updatedTouristSpot = await TouristSpot.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTouristSpot) {
      console.warn('⚠️ TouristSpot not found for update:', id);
      return res.status(404).json({ message: 'TouristSpot not found' });
    }

    console.log('✅ Location updated:', updatedTouristSpot.name);
    res.status(200).json(updatedTouristSpot);
  } catch (error) {
    console.error('❌ Error updating location:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==============================
// 🗑️ 5. Delete a Tourist Spot (Admin Only)
// ==============================
router.delete('/:id', auth, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  // Validate tourist spot ID before deletion
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid tourist spot ID' });
  }

  try {
    console.log('🗑️ Deleting tourist spot...');
    const deletedSpot = await TouristSpot.findByIdAndDelete(id);

    if (!deletedSpot) {
      return res.status(404).json({ message: 'Tourist spot not found' });
    }

    res.status(200).json({ message: 'Tourist spot deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting tourist spot:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
