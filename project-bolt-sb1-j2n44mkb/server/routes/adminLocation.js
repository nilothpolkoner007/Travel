import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Location from '../models/Location.js';
import { auth, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==============================
// 📍 Get All Locations (Admin Only)
// ==============================
router.get('/', auth, verifyAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching locations from the database...');

    const locations = await Location.find();

    if (!locations.length) {
      console.warn('❌ No locations found in the database.');
      return res.status(404).json({ message: 'No locations available' });
    }

    console.log(`✅ ${locations.length} locations retrieved successfully.`);
    res.status(200).json(locations);
  } catch (error) {
    console.error('❌ Error fetching locations:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ==============================
// ➕ Create a New Location (Admin Only)
// ==============================
router.post(
  '/',
  auth,
  verifyAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('image').isURL().withMessage('Valid image URL is required'),
    [
      body('coordinates.lat')
        .trim()
        .customSanitizer((value) => parseFloat(value))
        .isFloat()
        .withMessage('Latitude must be a valid number'),
      body('coordinates.lng')
        .trim()
        .customSanitizer((value) => parseFloat(value))
        .isFloat()
        .withMessage('Longitude must be a valid number'),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log('🚀 Incoming Payload:', req.body);
      // Ignore _id to prevent MongoDB error
      const { _id, ...locationData } = req.body;

      const location = new Location(locationData);
      await location.save();

      console.log('✅ New location added:', location.name);
      res.status(201).json(location);
    } catch (error) {
      console.error('❌ Error saving location:', error.message);
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
    const updatedLocation = await Location.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedLocation) {
      console.warn('⚠️ Location not found for update:', id);
      return res.status(404).json({ message: 'Location not found' });
    }

    console.log('✅ Location updated:', updatedLocation.name);
    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error('❌ Error updating location:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==============================
// 🗑️ Delete a Location (Admin Only)
// ==============================
router.delete('/:id', auth, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn('❌ Invalid location ID:', id);
    return res.status(400).json({ message: 'Invalid location ID' });
  }

  try {
    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      console.warn('⚠️ Location not found for deletion:', id);
      return res.status(404).json({ message: 'Location not found' });
    }

    console.log('✅ Location deleted:', deletedLocation.name);
    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting location:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
