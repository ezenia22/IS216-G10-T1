// Removes the one-off Kieran active-session seed, then creates Caitlynn's paid
// three-day history with a complete care report for every booked day.
// Run from server/: node src/seed/replaceKieranSessionWithCaitlynnHistory.js
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'
import Pet from '../models/petModel.js'
import Booking from '../models/bookingModel.js'
import CareChecklist from '../models/CareChecklist.js'
import VisitSession from '../models/VisitSession.js'
import Walk from '../models/walkModel.js'
import Payment from '../models/paymentModel.js'
import Message from '../models/Message.js'
import Review from '../models/reviewModel.js'
import Notification from '../models/notificationModel.js'
import { sgtMidnight, toSgtDateString } from '../models/Availability.js'

dotenv.config()

const KIERAN_NOTE = '[seed:kieran-ongoing-session] Two-day in-home care'
const HISTORY_NOTE = '[seed:caitlynnn-paid-history] Three-day care while away'
const HOME = [103.8500, 1.3000]
const WALK_PATH = [HOME, [103.8504, 1.3003], [103.8508, 1.3001], HOME]

const at = (date, time) => new Date(`${date}T${time}:00+08:00`)
const dayAgo = (days) => toSgtDateString(new Date(Date.now() - days * 24 * 60 * 60 * 1000))

async function removeKieranSession() {
  const booking = await Booking.findOne({ notes: KIERAN_NOTE })
  if (!booking) return false

  const [visits] = await Promise.all([
    VisitSession.find({ booking: booking._id }).select('_id'),
    CareChecklist.deleteMany({ bookingId: booking._id }),
    Payment.deleteMany({ bookingId: booking._id }),
    Message.deleteMany({ booking: booking._id }),
    Review.deleteMany({ booking: booking._id }),
    Notification.deleteMany({ booking: booking._id })
  ])
  await Walk.deleteMany({ $or: [{ booking: booking._id }, { visit: { $in: visits.map((visit) => visit._id) } }] })
  await VisitSession.deleteMany({ booking: booking._id })
  await Booking.deleteOne({ _id: booking._id })

  const pepper = await Pet.findOne({ owner: booking.ownerId, name: 'Pepper' })
  if (pepper && !await Booking.exists({ petIds: pepper._id })) {
    await Pet.deleteOne({ _id: pepper._id })
  }
  return true
}

async function seedPaidHistory() {
  const [owner, sitter] = await Promise.all([
    User.findOne({ username: 'caitlynnn', role: 'owner' }),
    User.findOne({ username: 'petbuddybenny', role: 'sitter' })
  ])
  if (!owner || !sitter) throw new Error('Could not find Caitlynn or petbuddybenny.')

  const pet = await Pet.findOne({ owner: owner._id, name: 'London' })
  if (!pet) throw new Error('Could not find London for caitlynnn.')

  // The final day is exactly one week ago; the booking includes that day and the two days before it.
  const days = [dayAgo(9), dayAgo(8), dayAgo(7)]
  const booking = await Booking.findOneAndUpdate(
    { ownerId: owner._id, sitterId: sitter._id, notes: HISTORY_NOTE },
    {
      $set: {
        ownerId: owner._id,
        sitterId: sitter._id,
        petIds: [pet._id],
        startDate: sgtMidnight(days[0]),
        endDate: sgtMidnight(days[2]),
        startTime: '09:00',
        endTime: '18:00',
        dayTimes: days.map((date) => ({ date, startTime: '09:00', endTime: '18:00' })),
        notes: HISTORY_NOTE,
        totalPrice: 120,
        status: 'paid'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const checklist = await CareChecklist.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        detailsSavedAt: at(days[0], '08:45'),
        items: [
          {
            category: 'feed', title: 'Breakfast and fresh water', petIds: [pet._id], dailyFrequency: 1,
            details: { food: 'Small-breed kibble', amount: 1, unit: 'cup', instructions: 'Serve in London’s ceramic bowl.' }
          },
          {
            category: 'walk', title: 'Morning neighbourhood walk', petIds: [pet._id], dailyFrequency: 1,
            walkRoute: { mode: 'instructions' },
            details: { instructions: 'Use the blue harness and take the quieter streets.' }
          },
          {
            category: 'play', title: 'Gentle fetch and cuddle time', petIds: [pet._id], dailyFrequency: 1,
            details: { instructions: 'A short game with the soft ball is plenty.' }
          }
        ]
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const feed = checklist.items.find((item) => item.category === 'feed')
  const walkTask = checklist.items.find((item) => item.category === 'walk')
  const play = checklist.items.find((item) => item.category === 'play')
  const notes = [
    'London had a relaxed first day. She finished breakfast, enjoyed a gentle walk, and settled down happily afterward.',
    'Another lovely day with London. She was playful at home and stayed calm while we passed the park.',
    'London was cheerful and comfortable today. We finished with a quiet cuddle before I left.'
  ]

  for (const [index, date] of days.entries()) {
    const visit = await VisitSession.findOneAndUpdate(
      { booking: booking._id, date },
      {
        $set: {
          booking: booking._id,
          sitter: sitter._id,
          date,
          status: 'completed',
          startedAt: at(date, '09:02'),
          endedAt: at(date, '17:48'),
          home: HOME,
          report: {
            notes: notes[index],
            photos: [
              { url: `https://placehold.co/600x600/png?text=London+day+${index + 1}+walk` },
              { url: `https://placehold.co/600x600/png?text=London+day+${index + 1}+at+home` }
            ]
          },
          awayEpisodes: [],
          locationGaps: []
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const walk = await Walk.findOneAndUpdate(
      { visit: visit._id, task: walkTask._id },
      {
        $set: {
          owner: owner._id,
          sitter: sitter._id,
          booking: booking._id,
          visit: visit._id,
          task: walkTask._id,
          mode: 'instructions',
          instructions: 'Morning neighbourhood walk',
          ownerNotes: 'Use the blue harness and take the quieter streets.',
          home: { type: 'Point', coordinates: HOME },
          status: 'completed',
          startedAt: at(date, '10:15'),
          endedAt: at(date, '10:47'),
          walkedPath: { type: 'LineString', coordinates: WALK_PATH },
          distanceM: 620 + index * 35,
          durationS: 32 * 60,
          deviations: []
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    await VisitSession.updateOne(
      { _id: visit._id },
      {
        $set: {
          completedTasks: [
            { task: feed._id, title: feed.title, at: at(date, '09:20') },
            { task: walkTask._id, title: walkTask.title, at: at(date, '10:47'), walk: walk._id },
            { task: play._id, title: play.title, at: at(date, '15:30') }
          ]
        }
      }
    )
  }

  await Payment.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        bookingId: booking._id,
        ownerId: owner._id,
        sitterId: sitter._id,
        amount: booking.totalPrice,
        method: 'visa',
        cardLast4: '4242',
        status: 'successful'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return { booking, days, sitter, pet }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  const removedKieranSession = await removeKieranSession()
  const { booking, days, sitter, pet } = await seedPaidHistory()
  console.log(JSON.stringify({
    removedKieranSession,
    bookingId: String(booking._id),
    owner: 'caitlynnn',
    sitter: sitter.username,
    pet: pet.name,
    days,
    status: booking.status,
    payment: 'successful'
  }))
}

run()
  .catch((err) => {
    console.error('Caitlynn paid-history seed failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
