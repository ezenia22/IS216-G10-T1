import Owner from '../models/ownerModel.js'
import Sitter from '../models/sitterModel.js'
import Booking from '../models/bookingModel.js'
import httpError from '../utils/httpError.js'

// GET /api/owners/me/favourites
export async function getFavourites(req, res) {
  const owner = await Owner.findById(req.user._id).populate(
    'favouriteSitters',
    'name avatarUrl location ratePerDay avgRating reviewCount petTypes'
  )
  res.json(owner.favouriteSitters)
}

// POST /api/owners/me/favourites/:sitterId
export async function addFavourite(req, res) {
  const { sitterId } = req.params
  if (!(await Sitter.exists({ _id: sitterId }))) throw httpError(404, 'Sitter not found')

  await Owner.findByIdAndUpdate(req.user._id, { $addToSet: { favouriteSitters: sitterId } })
  res.json({ message: 'Added to favourites' })
}

// DELETE /api/owners/me/favourites/:sitterId
export async function removeFavourite(req, res) {
  await Owner.findByIdAndUpdate(req.user._id, { $pull: { favouriteSitters: req.params.sitterId } })
  res.json({ message: 'Removed from favourites' })
}

// GET /api/owners/:id — the owner themself, or a sitter who has a booking with them
export async function getOwnerById(req, res) {
  const { id } = req.params
  const isSelf = String(req.user._id) === id

  if (!isSelf) {
    const linked = req.user.role === 'sitter' &&
      (await Booking.exists({ owner: id, sitter: req.user._id }))
    if (!linked) throw httpError(403, 'You can only view owners you have bookings with')
  }

  const owner = await Owner.findById(id).populate('pets')
  if (!owner) throw httpError(404, 'Owner not found')
  res.json(owner)
}