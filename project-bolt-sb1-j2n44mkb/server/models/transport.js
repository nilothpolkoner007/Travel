import mongoose from 'mongoose';

const validTypes = ['bus', 'train', '4wheeler', 'toto', 'taxi', 'bike', 'flight', 'ship', 'boat'];
const TransportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: {
      values: validTypes,
      message: 'Invalid transport type',
    },
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  availability: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stopage: {
    type: [String],
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
});





export default mongoose.model('Transport', TransportSchema);
