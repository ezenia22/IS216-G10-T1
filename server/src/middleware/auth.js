import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';
import httpError from '../utils/httpError.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Not logged in');

  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);      // returns an Owner or Sitter
  if (!user) throw httpError(401, 'User no longer exists');

  req.user = user;
  next();
});

export default protect;