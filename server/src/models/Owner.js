const mongoose = require('mongoose');
const User = require('./User');

const ownerSchema = new mongoose.Schema({
  address: String,
  emergencyContact: {
    name:  String,
    phone: String,
  },
  favouriteSitters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// owner.pets - pulls this owner's pets from the pets collection (not stored here)
ownerSchema.virtual('pets', {
  ref: 'Pet',
  localField: '_id',
  foreignField: 'owner',
});

module.exports = User.discriminator('Owner', ownerSchema, { value: 'owner' });