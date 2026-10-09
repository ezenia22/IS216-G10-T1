import mongoose from 'mongoose';
import User from './User.js';

const PET_TYPES = ['dog', 'cat', 'bird', 'rabbit', 'other'];
const SERVICES  = ['boarding', 'house-sitting', 'dog-walking', 'drop-in'];

const sitterSchema = new mongoose.Schema({
  bio:             { type: String, maxlength: 500 },
  ratePerDay:      { type: Number, required: true, min: 0 },
  petTypes:        [{ type: String, enum: PET_TYPES }],
  services:        [{ type: String, enum: SERVICES }],
  yearsExperience: { type: Number, min: 0, default: 0 },
  availability:    [{ from: Date, to: Date }],
  avgRating:       { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:     { type: Number, default: 0 },
  isVerified:      { type: Boolean, default: false },
});

sitterSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'sitter',
});

export default User.discriminator('Sitter', sitterSchema, { value: 'sitter' });