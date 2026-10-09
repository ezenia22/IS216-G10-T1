import { Router } from 'express'
import {
  createBooking, getMyBookings, getBookingById, updateBookingStatus
} from '../controllers/bookingController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()
router.use(protect)

router.get('/', asyncHandler(getMyBookings))
router.get('/:id', asyncHandler(getBookingById))
router.post('/', requireRole('owner'), asyncHandler(createBooking))
router.patch('/:id/status', asyncHandler(updateBookingStatus))

export default router