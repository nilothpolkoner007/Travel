import express from 'express';

import Location from '../models/Location.js';
import Transport from '../models/Transport.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const routes = await Transport.find(); // Check here
    res.json(routes);
  } catch (err) {
    console.error('❌ Failed to fetch routes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id)
      .populate('transports');
    
    if (!transport) {
      return res.status(404).json({ message: 'Transport not found' });
    }
    
    res.json(transport);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
})



export default router;

