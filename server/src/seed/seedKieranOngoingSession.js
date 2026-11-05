// Adds a two-day, in-progress visit for the Kieran test accounts.
// Run from server/: node src/seed/seedKieranOngoingSession.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'
import Pet from '../models/petModel.js'
import Booking from '../models/bookingModel.js'
import CareChecklist from '../models/CareChecklist.js'
import VisitSession from '../models/VisitSession.js'
import { sgtMidnight, toSgtDateString } from '../models/Availability.js'

dotenv.config()

const SEED_NOTE = '[seed:kieran-ongoing-session] Two-day in-home care'

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)

  const [sitter, owner] = await Promise.all([
    User.findOne({ username: 'kieranSitter', role: 'sitter' }),
    User.findOne({ username: 'kieranOwner', role: 'owner' })
  ])
  if (!sitter || !owner) throw new Error('Could not find the Kieran sitter and owner test accounts.')

  const pet = await Pet.findOneAndUpdate(
    { owner: owner._id, name: 'Pepper' },
    {
      $setOnInsert: {
        owner: owner._id,
        name: 'Pepper',
        species: 'Dog',
        breed: 'Cavapoo',
        ageMonths: 30,
        description: 'Friendly with visitors and loves short evening walks.'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const today = toSgtDateString(new Date())
  const tomorrow = toSgtDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))
  const startDate = sgtMidnight(today)
  const endDate = sgtMidnight(tomorrow)
  const booking = await Booking.findOneAndUpdate(
    { sitterId: sitter._id, ownerId: owner._id, notes: SEED_NOTE },
    {
      $set: {
        petIds: [pet._id],
        startDate,
        endDate,
        startTime: '10:00',
        endTime: '20:00',
        dayTimes: [
          { date: today, startTime: '10:00', endTime: '20:00' },
          { date: tomorrow, startTime: '10:00', endTime: '20:00' }
        ],
        notes: SEED_NOTE,
        totalPrice: 90,
        status: 'in-progress'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const checklist = await CareChecklist.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        detailsSavedAt: new Date(),
        items: [
          {
            category: 'feed',
            title: 'Refresh water and serve dinner',
            petIds: [pet._id],
            dailyFrequency: 1,
            details: { food: 'Dry food', amount: 1, unit: 'cup', instructions: 'Fresh water in the blue bowl.' }
          },
          {
            category: 'walk',
            title: 'Evening neighbourhood walk',
            petIds: [pet._id],
            dailyFrequency: 1,
            details: { instructions: 'Keep the walk relaxed and avoid the busy main road.' },
            walkRoute: { mode: 'instructions' }
          },
          {
            category: 'play',
            title: 'Indoor playtime',
            petIds: [pet._id],
            dailyFrequency: 1,
            details: { instructions: 'Pepper likes the rope toy for a gentle game of tug.' }
          }
        ]
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const feedTask = checklist.items.find((item) => item.category === 'feed')
  const existing = await VisitSession.findOne({ booking: booking._id, date: today })
  const visit = existing ?? await VisitSession.create({
    booking: booking._id,
    sitter: sitter._id,
    date: today,
    status: 'active',
    startedAt: new Date(Date.now() - 90 * 60 * 1000),
    startCheck: { reason: 'no-location', note: 'Seeded active session for Kieran’s test account.' },
    completedTasks: [{ task: feedTask._id, title: feedTask.title, at: new Date(Date.now() - 30 * 60 * 1000) }],
    report: { notes: '', photos: [] }
  })

  console.log(JSON.stringify({
    bookingId: String(booking._id),
    visitId: String(visit._id),
    sitter: sitter.username,
    owner: owner.username,
    pet: pet.name,
    dates: [today, tomorrow],
    status: booking.status
  }))
}

seed()
  .catch((err) => {
    console.error('Kieran ongoing-session seed failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
