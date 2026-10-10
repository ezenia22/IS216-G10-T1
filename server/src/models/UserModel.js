import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hidePassword = {
  virtuals: true,
  transform(doc, ret) { delete ret.password; return ret; },
};

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },   // "username" on the frontend
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 8, select: false },
  bio:       { type: String, default: '', maxlength: 500 },   // from Caitlyn's model, now for owners + sitters
  phone:     String,
  location:  String,
  avatarUrl: String,
}, {
  timestamps: true,
  discriminatorKey: 'role',
  toJSON: hidePassword,
  toObject: hidePassword,
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);