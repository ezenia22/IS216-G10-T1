import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'
import Owner from './src/models/Owner.js'
import Sitter from './src/models/Sitter.js'
import Pet from './src/models/Pet.js'
import Booking from './src/models/Booking.js'
import Review from './src/models/Review.js'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to DB:', mongoose.connection.name)

  for (const Model of [User, Pet, Booking, Review]) {
    await Model.createCollection()
    await Model.syncIndexes()
  }
  await Promise.all([User, Pet, Booking, Review].map(M => M.deleteMany({})))

  const owner = await Owner.create({
    name: 'Olivia Owner', email: 'owner@test.com', password: 'password123',
    location: 'Tampines', address: '123 Tampines St 11',
    emergencyContact: { name: 'Mum', phone: '91234567' },
  })

  const sitter = await Sitter.create({
    name: 'Sam Sitter', email: 'sitter@test.com', password: 'password123',
    location: 'Bedok', bio: 'Dog lover, 3 years experience',
    ratePerDay: 40, petTypes: ['dog', 'cat'], services: ['boarding', 'dog-walking'],
    yearsExperience: 3,
    availability: [{ from: new Date('2026-11-01'), to: new Date('2026-11-30') }],
  })

  const pet = await Pet.create({
    owner: owner._id, name: 'Mochi', species: 'dog', breed: 'Shiba Inu', age: 3,
    description: 'Feed twice a day, scared of thunder',
  })

  const booking = await Booking.create({
    owner: owner._id, sitter: sitter._id, pets: [pet._id],
    startDate: new Date('2026-11-05'), endDate: new Date('2026-11-07'),
    totalPrice: 80, status: 'completed',
  })

  await Review.create({
    booking: booking._id, reviewer: owner._id, sitter: sitter._id,
    rating: 5, comment: 'Mochi came home happy!',
  })
  
  await Sitter.findByIdAndUpdate(sitter._id, { avgRating: 5, reviewCount: 1 })

  console.log('🌱 Seed complete — login: owner@test.com / sitter@test.com, password123')
  await mongoose.disconnect()
}

seed().catch(err => { console.error('❌', err.message); process.exit(1) })