import { Router } from 'express'
import { register, login, getMe, updateMe, logout } from '../controllers/authController.js'
import asyncHandler from '../middleware/asyncHandler.js'
import protect from '../middleware/auth.js'

const router = Router()

// public
router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.post('/logout', asyncHandler(logout))

// logged-in users only
router.get('/me', protect, asyncHandler(getMe))
router.put('/me', protect, asyncHandler(updateMe))

export default router