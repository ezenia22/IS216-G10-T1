import { Router } from 'express'
import {
  getReviews, createReview, updateReview, deleteReview
} from '../controllers/reviewController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()

router.get('/', asyncHandler(getReviews))
router.post('/', protect, requireRole('owner'), asyncHandler(createReview))
router.put('/:id', protect, requireRole('owner'), asyncHandler(updateReview))
router.delete('/:id', protect, requireRole('owner'), asyncHandler(deleteReview))

export default router