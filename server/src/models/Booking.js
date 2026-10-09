import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sitter:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pets:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  startDate:  { type: Date, required: true },
  endDate:    { type: Date, required: true },
  totalPrice: Number,
  status:     {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending',
  },
  message:    String,
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);