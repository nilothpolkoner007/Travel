import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  bestTime: String,
  entryFee: String,
  duration: String,
  price: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

export default mongoose.model('Hotel', hotelSchema);
  