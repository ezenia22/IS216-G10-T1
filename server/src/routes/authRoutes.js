import { Router } from 'express'
import { register, login, getMe, updateMe } from '../controllers/authController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.get('/me', protect, asyncHandler(getMe))
router.put('/me', protect, asyncHandler(updateMe))

export default router