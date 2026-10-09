import 'dotenv/config'                 // must be the first import
import express from 'express'
import cors from 'cors'
import connectDB from './src/config/db.js'

// register Owner/Sitter so User.findById() returns the right type
import './src/models/Owner.js'
import './src/models/Sitter.js'

import authRoutes from './src/routes/authRoutes.js'
import petRoutes from './src/routes/petRoutes.js'
import sitterRoutes from './src/routes/sitterRoutes.js'
import errorHandler from './src/middleware/errorHandler.js'
import ownerRoutes from './src/routes/ownerRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import reviewRoutes from './src/routes/reviewRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/sitters', sitterRoutes)
app.use('/api/owners', ownerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)                  // must be last

const PORT = process.env.PORT || 5000
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
})