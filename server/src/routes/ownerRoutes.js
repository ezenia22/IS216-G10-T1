import { Router } from 'express'
import {
  getFavourites, addFavourite, removeFavourite, getOwnerById
} from '../controllers/ownerController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()
router.use(protect)

router.get('/me/favourites', requireRole('owner'), asyncHandler(getFavourites))
router.post('/me/favourites/:sitterId', requireRole('owner'), asyncHandler(addFavourite))
router.delete('/me/favourites/:sitterId', requireRole('owner'), asyncHandler(removeFavourite))
router.get('/:id', asyncHandler(getOwnerById))

export default router