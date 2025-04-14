import express from 'express';
import { auth, verifyAdmin } from '../middleware/auth.js';
import Hotel from '../models/hotel.js';
import Location from '../models/Location.js';

const router = express.Router();

// Get all hotels (with optional filtering by location)
router.get('/', auth,
  verifyAdmin, async (req, res) => {
  try {

    const { locationId } = req.query;
    const query = locationId ? { location: locationId } : {};

    const hotels = await Hotel.find(query).populate('location', 'name country');
    res.status(200).json(hotels);
  } catch (error) {
    console.error('❌ Error fetching hotels:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new hotel (Admin Only)
router.post('/', auth, verifyAdmin, async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    const savedHotel = await newHotel.save();

    if (req.body.location) {
      await Location.findByIdAndUpdate(req.body.location, {
        $push: { hotels: savedHotel._id },
      });
    }

    res.status(201).json(savedHotel);
  } catch (error) {
    res.status(500).json({ message: 'Error creating hotel', error });
  }
});

// Update a hotel (Admin Only)
router.put('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hotel', error });
  }
});

// Delete a hotel (Admin Only)
router.delete('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting hotel', error });
  }
});

export default router;
