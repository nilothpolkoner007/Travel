import mongoose from 'mongoose';

const touristSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    bestTime: { type: String },
    entryFee: { type: String },
    duration: { type: String },
    price: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('TouristSpot', touristSpotSchema);