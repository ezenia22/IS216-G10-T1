import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Owner from '../models/Owner.js';
import Sitter from '../models/Sitter.js';
import httpError from '../utils/httpError.js';

const MODELS = { owner: Owner, sitter: Sitter };
// fields users must never set on themselves
const PROTECTED = ['role', 'avgRating', 'reviewCount', 'isVerified', '_id', 'createdAt', 'updatedAt'];

function strip(body) {
  const data = { ...body };
  PROTECTED.forEach(f => delete data[f]);
  return data;
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register   body: { role: 'owner' | 'sitter', name, email, password, ... }
export async function register(req, res) {
  const Model = MODELS[req.body.role];
  if (!Model) throw httpError(400, 'role must be "owner" or "sitter"');

  const user = await Model.create(strip(req.body));
  res.status(201).json({ token: signToken(user), user });
}

// POST /api/auth/login   body: { email, password }
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password');
  }
  res.json({ token: signToken(user), user });
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json(req.user);
}

// PUT /api/auth/me — edit own profile (owner or sitter fields)
export async function updateMe(req, res) {
  const updates = strip(req.body);
  delete updates.password;   // password changes need their own route
  delete updates.email;

  const Model = MODELS[req.user.role];
  const user = await Model.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json(user);
}