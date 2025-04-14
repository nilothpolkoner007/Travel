import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/auth.js';
import locationRoutes from './routes/locations.js';
import touristSpotRoutes from './routes/touristSpots.js';
import hotelRoutes from './routes/hotels.js';
import transportRoutes from './routes/transport.js';
import connectDB from './utils/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Connect to MongoDB
connectDB();
 
// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/tourist-spots', touristSpotRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/transport', transportRoutes);
 
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
