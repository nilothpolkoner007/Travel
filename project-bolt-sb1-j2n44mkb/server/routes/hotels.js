import express from 'express';
import Location from '../models/Location.js';
import hotel from '../models/hotel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const hotels = await hotel.find();
    res.json(hotels);
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).send('Server error');
  }
});


router.get('/find/:id', async (req, res) => {
  try {
    const location = await hotel.findById(req.params.id).
    populate('hotels');
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});




export default router;