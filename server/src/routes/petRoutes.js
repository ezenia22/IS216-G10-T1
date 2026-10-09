import { Router } from 'express'
import {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
} from '../controllers/petController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'

const router = Router()

router.use(protect, requireRole('owner'))   // every pet route: logged-in owners only

router.get('/', asyncHandler(getPets))
router.get('/:id', asyncHandler(getPetById))
router.post('/', asyncHandler(createPet))
router.put('/:id', asyncHandler(updatePet))
router.delete('/:id', asyncHandler(deletePet))

export default router