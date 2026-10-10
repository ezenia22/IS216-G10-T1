import 'dotenv/config'                 // must be the first import
import express from 'express'
import cors from 'cors'
// import MongoStore from 'connect-mongo'
import connectDB from './src/config/db.js'
// import session from 'express-session'
import mongoose from 'mongoose'

import './src/models/ownerModel.js'
import './src/models/sitterModel.js'

import authRoutes from './src/routes/authRoutes.js'
import petRoutes from './src/routes/petRoutes.js'
import sitterRoutes from './src/routes/sitterRoutes.js'
import errorHandler from './src/middleware/errorHandler.js'
import ownerRoutes from './src/routes/ownerRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import reviewRoutes from './src/routes/reviewRoutes.js'

if (!process.env.SESSION_SECRET){
  console.error('Session Secret is missing from .env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: CLIENT_ORIGIN ,
  credentials: true
}))
app.use(express.json())

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   cookie: {
//     httpOnly: true,
//     sameSite: 'lax',
//     secure: false, 
//     maxAge: 1000 * 60 * 60 * 24 * 7
//   }
// }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use("/api/auth", authRoutes);
app.use('/api/pets', petRoutes)
app.use('/api/sitters', sitterRoutes)
app.use('/api/owners', ownerRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found' }))
app.use(errorHandler)                  // must be last

app.use(errorHandler)

async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`PetSociety API listening on http://localhost:${PORT}`)
      console.log('Connected to DB:', mongoose.connection.name, 'on', mongoose.connection.host) // checking which collection
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
