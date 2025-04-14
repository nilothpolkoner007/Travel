import Tourist from '../models/agency.js';

export const createTourist = async (req, res) => {
  try {
    const newTourist = new Tourist(req.body);
    const saved = await newTourist.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find().populate('location TouristSpot');
    res.json(tourists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTourist = async (req, res) => {
  try {
    const updated = await Tourist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTourist = async (req, res) => {
  try {
    const deleted = await Tourist.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
