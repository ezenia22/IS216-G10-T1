import mongoose from 'mongoose'
import Review from '../models/reviewModel.js'
import Booking from '../models/bookingModel.js'
import Sitter from '../models/sitterModel.js'
import httpError from '../utils/httpError.js'

async function refreshSitterRating(sitterId) {
  const [stats] = await Review.aggregate([
    { $match: { sitter: new mongoose.Types.ObjectId(String(sitterId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  await Sitter.findByIdAndUpdate(sitterId, {
    avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewCount: stats?.count ?? 0,
  })
}

async function findOwnReview(req) {
  const review = await Review.findById(req.params.id)
  if (!review) throw httpError(404, 'Review not found')
  if (!review.reviewer.equals(req.user._id)) throw httpError(403, 'This is not your review')
  return review
}

// GET /api/reviews?sitter=SITTER_ID   (public)
export async function getReviews(req, res) {
  const filter = {}
  if (req.query.sitter) filter.sitter = req.query.sitter

  const reviews = await Review.find(filter)
    .populate('reviewer', 'name avatarUrl')
    .sort({ createdAt: -1 })
  res.json(reviews)
}

// POST /api/reviews   (owner)   body: { bookingId, rating, comment }
export async function createReview(req, res) {
  const { bookingId, rating, comment } = req.body
  if (!bookingId || !rating) throw httpError(400, 'bookingId and rating are required')

  const booking = await Booking.findById(bookingId)
  if (!booking) throw httpError(404, 'Booking not found')
  if (!booking.owner.equals(req.user._id)) throw httpError(403, 'You can only review your own bookings')
  if (booking.status !== 'completed') throw httpError(400, 'You can only review completed bookings')
  if (await Review.exists({ booking: booking._id })) throw httpError(409, 'You already reviewed this booking')

  const review = await Review.create({
    booking: booking._id,
    reviewer: req.user._id,
    sitter: booking.sitter,
    rating,
    comment,
  })
  await refreshSitterRating(booking.sitter)
  res.status(201).json(review)
}

// PUT /api/reviews/:id   (the reviewer)   body: { rating, comment }
export async function updateReview(req, res) {
  const review = await findOwnReview(req)
  const { rating, comment } = req.body
  if (rating !== undefined) review.rating = rating
  if (comment !== undefined) review.comment = comment
  await review.save()
  await refreshSitterRating(review.sitter)
  res.json(review)
}

// DELETE /api/reviews/:id   (the reviewer)
export async function deleteReview(req, res) {
  const review = await findOwnReview(req)
  await review.deleteOne()
  await refreshSitterRating(review.sitter)
  res.json({ message: 'Review deleted' })
}