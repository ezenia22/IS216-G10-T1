import Booking from '../models/bookingModel.js'
import Pet from '../models/petModel.js'
import Sitter from '../models/sitterModel.js'
import httpError from '../utils/httpError.js'

const DAY = 24 * 60 * 60 * 1000

const POPULATE = [
  { path: 'owner',  select: 'name phone location avatarUrl' },
  { path: 'sitter', select: 'name phone location avatarUrl ratePerDay avgRating' },
  { path: 'pets',   select: 'name species breed age description photoUrl' },
]

// who can move a booking from which status to which
const TRANSITIONS = {
  sitter: { pending: ['accepted', 'declined'], accepted: ['completed'] },
  owner:  { pending: ['cancelled'], accepted: ['cancelled'] },
}

const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b)
const isParticipant = (booking, user) =>
  sameId(booking.owner, user._id) || sameId(booking.sitter, user._id)

async function sitterIsFree(sitterId, start, end, excludeId) {
  const clash = await Booking.exists({
    sitter: sitterId,
    status: 'accepted',
    startDate: { $lt: end },
    endDate: { $gt: start },
    ...(excludeId && { _id: { $ne: excludeId } }),
  })
  return !clash
}

// POST /api/bookings   (owner)
// body: { sitterId, petIds: [...], startDate, endDate, message }
export async function createBooking(req, res) {
  const { sitterId, petIds, startDate, endDate, message } = req.body
  if (!sitterId || !Array.isArray(petIds) || !petIds.length || !startDate || !endDate) {
    throw httpError(400, 'sitterId, petIds, startDate and endDate are required')
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start) || isNaN(end) || end <= start) throw httpError(400, 'endDate must be after startDate')
  if (start < new Date()) throw httpError(400, 'startDate cannot be in the past')

  const sitter = await Sitter.findById(sitterId)
  if (!sitter) throw httpError(404, 'Sitter not found')

  const ids = [...new Set(petIds)]
  const pets = await Pet.find({ _id: { $in: ids }, owner: req.user._id })
  if (pets.length !== ids.length) throw httpError(400, 'One or more pets are not yours')

  const unsupported = pets.filter(p => !sitter.petTypes.includes(p.species))
  if (unsupported.length) {
    throw httpError(400, `${sitter.name} does not care for: ${unsupported.map(p => p.species).join(', ')}`)
  }

  if (!(await sitterIsFree(sitter._id, start, end))) {
    throw httpError(409, 'Sitter is already booked for those dates')
  }

  const days = Math.max(1, Math.ceil((end - start) / DAY))
  const booking = await Booking.create({
    owner: req.user._id,
    sitter: sitter._id,
    pets: pets.map(p => p._id),
    startDate: start,
    endDate: end,
    totalPrice: days * sitter.ratePerDay,
    message,
  })

  res.status(201).json(await booking.populate(POPULATE))
}

// GET /api/bookings?status=pending   (owner sees theirs, sitter sees theirs)
export async function getMyBookings(req, res) {
  const filter = { [req.user.role]: req.user._id }   // { owner: id } or { sitter: id }
  if (req.query.status) filter.status = req.query.status

  const bookings = await Booking.find(filter).populate(POPULATE).sort({ startDate: -1 })
  res.json(bookings)
}

// GET /api/bookings/:id
export async function getBookingById(req, res) {
  const booking = await Booking.findById(req.params.id).populate(POPULATE)
  if (!booking) throw httpError(404, 'Booking not found')
  if (!isParticipant(booking, req.user)) throw httpError(403, 'Not your booking')
  res.json(booking)
}

// PATCH /api/bookings/:id/status   body: { status }
export async function updateBookingStatus(req, res) {
  const { status } = req.body
  const booking = await Booking.findById(req.params.id)
  if (!booking) throw httpError(404, 'Booking not found')
  if (!isParticipant(booking, req.user)) throw httpError(403, 'Not your booking')

  const allowed = TRANSITIONS[req.user.role][booking.status] || []
  if (!allowed.includes(status)) {
    throw httpError(400, `As ${req.user.role}, you cannot change a ${booking.status} booking to "${status}"`)
  }

  if (status === 'accepted' &&
      !(await sitterIsFree(booking.sitter, booking.startDate, booking.endDate, booking._id))) {
    throw httpError(409, 'You already have an accepted booking overlapping these dates')
  }

  booking.status = status
  await booking.save()
  res.json(await booking.populate(POPULATE))
}