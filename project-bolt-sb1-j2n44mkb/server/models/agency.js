import mongoose from "mongoose";


const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  TouristSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TouristSpot',
    required: true,
  },
  price: String,
});

export default mongoose.model('agency', agencySchema);