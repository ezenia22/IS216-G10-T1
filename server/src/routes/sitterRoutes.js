import { Router } from 'express'
import { getSitters, getSitterById } from '../controllers/sitterController.js'
import asyncHandler from '../middleware/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(getSitters))
router.get('/:id', asyncHandler(getSitterById))

export default router