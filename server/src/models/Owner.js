import mongoose from 'mongoose';
import User from './User.js';

const ownerSchema = new mongoose.Schema({
  address: String,
  emergencyContact: {
    name:  String,
    phone: String,
  },
  favouriteSitters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

ownerSchema.virtual('pets', {
  ref: 'Pet',
  localField: '_id',
  foreignField: 'owner',
});

export default User.discriminator('Owner', ownerSchema, { value: 'owner' });