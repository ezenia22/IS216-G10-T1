import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Owner from '../models/ownerModel.js';
import Sitter from '../models/sitterModel.js';
import httpError from '../utils/httpError.js';

const MODELS = { owner: Owner, sitter: Sitter };
// fields users must never set on themselves
const PROTECTED = ['role', 'avgRating', 'reviewCount', 'isVerified', '_id', 'createdAt', 'updatedAt'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*]/;

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

// What the frontend receives: full profile (no password) + id/username/role at top level,
// so Caitlyn's frontend can keep reading data.id, data.username, data.role
function publicUser(user) {
  return { ...user.toJSON(), id: user._id, username: user.name };
}

// Signup validation rules (Caitlyn)
function validateSignup({ username, email, password, confirmPassword, role }) {
  if (!username || !email || !password || !confirmPassword || !role) {
    return ['Please fill in all fields.'];
  }

  const errors = [];
  if (!EMAIL_REGEX.test(email.trim())) errors.push('Must be a valid email.');
  if (!MODELS[role]) errors.push('Role must be owner or sitter.');
  if (password !== confirmPassword) errors.push('Passwords do not match.');
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    errors.push('Password must contain at least 1 special character.');
  }
  return errors;
}

// POST /api/auth/register
// body: { role, username, email, password, confirmPassword, ...optional profile fields }
export async function register(req, res) {
  const { username, email, password, confirmPassword, role, ...profile } = req.body;

  const errors = validateSignup(req.body);
  const cleanEmail = email?.trim().toLowerCase();

  if (!errors.length && (await User.exists({ email: cleanEmail }))) {
    errors.push('Email is already registered.');
  }
  if (errors.length) return res.status(400).json({ errors });

  try {
    const user = await MODELS[role].create({
      ...strip(profile),
      name: username.trim(),
      email: cleanEmail,
      password,              // hashed automatically by the pre-save hook in User.js
    });
    res.status(201).json({ token: signToken(user), ...publicUser(user) });
  } catch (err) {
    // model rule failures → same { errors: [...] } format as above
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: Object.values(err.errors).map(e => e.message) });
    }
    throw err;
  }
}

// POST /api/auth/login   body: { email, password }
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Please enter both email and password.');

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, 'Invalid email or password.');
  }
  res.json({ token: signToken(user), ...publicUser(user) });
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json(publicUser(req.user));
}

// PUT /api/auth/me — edit own profile (owner or sitter fields)
export async function updateMe(req, res) {
  const updates = strip(req.body);
  delete updates.password;   // password changes need their own route
  delete updates.email;
  delete updates.username;
  if (req.body.username) updates.name = req.body.username.trim();

  const Model = MODELS[req.user.role];
  const user = await Model.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json(publicUser(user));
}

// POST /api/auth/logout
// JWT logins are stateless — the frontend logs out by deleting its stored token.
// This endpoint exists so the frontend's logout call still gets a response.
export async function logout(req, res) {
  res.json({ message: 'Logged out' });
}