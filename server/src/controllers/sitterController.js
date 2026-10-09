import Sitter from '../models/Sitter.js';
import httpError from '../utils/httpError.js';

// GET /api/sitters?petType=dog&maxRate=50&location=Bedok&service=boarding
export async function getSitters(req, res) {
  const { petType, maxRate, location, service } = req.query;
  const filter = {};
  if (petType)  filter.petTypes = petType;
  if (service)  filter.services = service;
  if (maxRate)  filter.ratePerDay = { $lte: Number(maxRate) };
  if (location) filter.location = new RegExp(location, 'i');

  const sitters = await Sitter.find(filter).sort({ avgRating: -1 });
  res.json(sitters);
}

// GET /api/sitters/:id
export async function getSitterById(req, res) {
  const sitter = await Sitter.findById(req.params.id).populate({
    path: 'reviews',
    populate: { path: 'reviewer', select: 'name avatarUrl' },
  });
  if (!sitter) throw httpError(404, 'Sitter not found');
  res.json(sitter);
}