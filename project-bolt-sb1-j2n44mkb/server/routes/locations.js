import express from 'express';
import { body, validationResult } from 'express-validator';
import { verifyAdmin } from '../utils/verifyToken.js';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocation,
  getLocations,
} from '../controllers/LocationController.js';
import Location from '../models/Location.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import TouristSpot from '../models/TouristSpot.js';
import mongoose from 'mongoose';


const router = express.Router();
router.get('/', auth,  async (req, res) => {
  try {
    console.log('Fetching locations...');
    const locations = await Location.find();
    console.log('Locations retrieved:', locations);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get nearby tourist spots for a location
router.get('/nearby/:id', async (req, res) => {
  try {
    const locationId = req.params.id;

    // Find all tourist spots with the given location
    const spots = await TouristSpot.find({ location: locationId }).select('name coordinates');

    if (!spots.length) {
      return res.status(404).json({ message: 'No tourist spots found for this location' });
    }

    res.json(spots);
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all locations with optional search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const locations = await Location.find(query);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single location by ID
// Get a single location by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid location ID' });
  }

  try {
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    console.error('Error fetching location:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Create a new location (Admin Only)
router.post(
  '/',
  auth,
  verifyAdmin,
  [
    body('name').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('image').isURL(),
    body('coordinates').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const location = new Location(req.body);
      await location.save();
      res.status(201).json(location);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },
);

// Update a location (Admin Only)
router.put('/:id', auth, verifyAdmin, updateLocation);

// Delete a location (Admin Only)
router.delete('/:id', auth, verifyAdmin, deleteLocation);

export default router;
