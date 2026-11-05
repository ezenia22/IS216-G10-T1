# PetSociety (IS216 G10-T1)

PetSociety connects pet owners in Singapore with trusted pet sitters. Owners find a sitter, book care for their pets, follow each visit live, and pay online. Sitters manage their calendar and requests, run each visit with a checklist, and get paid.

- **Live site:** https://is216-g10-t1.vercel.app/
- **GitHub repo:** https://github.com/ezenia22/IS216-G10-T1

## Test accounts (live site)

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Owner | caitlynnn | caitSitter@gmail.com | Testing123! |
| Sitter | kieranSitter | kieran.test.sitter@example.com | Testd0ab33ce! |

Log in with either the email or the username.

## Features

### Unique selling points (USP)

| # | Feature | What it does |
| --- | --- | --- |
| USP 1 | Recommendation-based sitter matching | "Recommended for me" shows only sitters who take every kind of pet the owner has and offer at least one service the owner needs, best match first, with a tag explaining why (for example "Takes Dog, Cat", "Offers Grooming"). |
| USP 2 | Structured care checklist | Each booking is built from care tasks (feed, walk, medicine and more), each with times a day, with the option to pick specific days. The price is worked out from the tasks, and the owner adds care details (feeding times, food, amount, instructions) before the first visit. |
| USP 3 | Live session location and task progress | During a visit the owner sees the sitter's live location, which tasks are ticked off, walks as they happen, and alerts, without needing to message the sitter. |
| USP 4 | Walk-route accountability | Owners record walking routes from home on a map. During a walk the sitter's path is tracked; going more than 25 m off the route warns the sitter, and more than 50 m notifies the owner. Walks must start and finish at the home, or be ended early with a reason. |

### Core features (CSP)

| # | Feature | What it does |
| --- | --- | --- |
| CSP 1 | Sitter availability calendar | Sitters mark days and half-hour slots (7 am to 12 am) as free or blocked. Owners can only book free times, and confirmed bookings can sync to the sitter's Google Calendar. |
| CSP 2 | Sitter profiles, services and ratings | Public sitter profiles show bio, experience, pet types, services and prices, photos, badges, reviews and average rating. |
| CSP 3 | Sitter search and filters (map and calendar) | Search by name, distance from an address or your location, available dates and hours, pet type and rating, on a list and a map. Sitters free for only part of the range are shown separately, with which days they're free. |
| CSP 4 | Booking lifecycle | Request → sitter accepts or declines → owner confirms → session(s) → completed → paid, plus withdraw, cancel (with a reason) and expiry. |
| CSP 5 | Notifications and session chat | In-app notifications for every booking, session, walk and payment event, with an unread badge, plus a chat between owner and sitter while a booking is confirmed or in progress. |
| CSP 6 | Interactive Live Task Checklist | The sitter tracks task progress by ticking off tasks on a checklist on session page | live task progress is viewable to owner
| CSP 7 | Session reports and photos | When a session ends, the sitter submits notes and up to 3 photos. The owner reads the report with ticked tasks, walks and a timeline of where the sitter was and when they completed tasks |
| CSP 8 | Payment and reviews | The owner pays a completed booking by card through Stripe Checkout (test mode), then leaves a 1 to 5 star review that updates the sitter's rating. |

### Full feature list

**Accounts and profiles**
- Register as an owner or sitter, with live password rules; log in with email or username; log out; change password. Logins last 7 days.
- Owners add pets (photo, species, age) and an address picked from OneMap suggestions (Singapore only), plus "Services I need".
- Sitters add bio, "Sitting since", pet types, services, service area and photos. 

**Finding a sitter**
- Name search, filters (distance, dates and hours, pet type, rating), map view, and "Recommended for me" (USP 1).
- Logged-out visitors can browse sitters but must log in to book.

**Booking**
- Pick pets, one or several days (with different hours per day if needed), and care tasks. The server works out the price, so the page can't fake it.
- Sitter accepts or declines; owner confirms; either side can cancel with a reason; owners can withdraw a request.
- Care details are added after confirming and lock once the first session starts.

**Sessions and walks (sitter)**
- Start a session at the owner's home (GPS check within 75 m), tick off tasks, do walks with live tracking, end with notes and photos.
- Owners follow along live (USP 3) and get alerts (USP 4).

**Owner tools**
- My Bookings with tabs (to confirm, upcoming, to pay, past), Booking Detail, My Routes (record and rename walk routes), session reports.

**Sitter tools**
- Home dashboard (new requests, upcoming, today), Booking Requests with tabs, Calendar, Transactions (payments received, filterable).

**Notifications** (CSP 5)
- New request, request sent, accepted, confirmed, declined, cancelled, expired, session started, session started without a location check, session ended automatically, off route, back on route, walk ended early, back home reminder, payment due, payment successful, payment received, payment failed.

### Edge cases handled

**Sessions**
- **Starting a second session without ending the first:** refused with "End your other session before starting this one." Only one session can run at a time, so one owner never sees the location for another owner's visit.
- **Starting today's session twice:** refused with "Today's session has already been started."
- **Ending without a note:** blocked: "Add your notes for the owner before ending the session." The server also refuses an empty note.
- **Ending with unticked tasks:** the sitter is asked to confirm before ending, so it's a warning, not a block. The report shows the owner which tasks weren't done.
- **Ending while a walk is still running:** refused until the walk is finished or ended early.
- **Weak GPS or too far from the home at check-in:** the start is refused with the reason ("out of range" with the distance, or "no location" when GPS is missing or less accurate than 100 m). The sitter can still start by writing a note of up to 200 characters, and the owner is warned ("session started without a location check") with that note.
- **More than 3 photos in a report:** refused before anything is uploaded.
- **A session from an earlier day not ended past midnight:** it stays open on the Session page so the sitter can still submit the report. Location sharing and new walks stop 30 minutes after the booked end time.
- **The sitter never ends a session:** it ends automatically 6 hours after the booked end time with "The sitter didn't submit a report." Both sides are notified, any walk still running is ended, and on the booking's last day the booking becomes completed so the owner can pay.
- **The sitter never starts a confirmed session:** once the booked end time passes, the booking becomes Expired and both the owner and the sitter are notified. The owner is never charged for it.

**Walks**
- **Ending a walk early:** allowed anywhere, but the sitter must give a reason (up to 200 characters), which the owner is told. An ended-early walk still counts toward that task.
- **Starting or finishing a walk away from the home:** refused ("Start the walk at the owner's home." / "Finish the walk at the owner's home, or end it early.").
- **Going off route:** the sitter is warned at 25 m, and the owner notified at 50 m (once per deviation), then told when the sitter is back on route.
- **Two walks at once, or more walks than booked for the day:** refused.
- **Back at the home with a walk still running for 20 minutes:** the sitter gets a reminder to end it.

**Bookings**
- **A request the sitter never answers, or the owner never confirms:** expires at its start time, and the owner is notified.
- **Clashes:** a sitter can't accept a request that overlaps one they already accepted, and an owner can't confirm the same pet in two bookings at the same time. Other owners' pending requests don't block a time.
- **Times outside the sitter's availability, in the past, or not on the half-hour:** refused, naming the day.
- **Cancelling:** needs a reason (up to 300 characters); paid, completed and in-progress bookings can't be cancelled.
- **Paying:** only once the booking is completed, never twice. Coming back from Stripe without paying shows "Payment was cancelled. You can try again."
- **Reviews:** one per booking, only once it's completed.
- **Access:** every page and API checks login and role, and you can only see bookings, pets, routes, chats and notifications that are yours.

## APIs and libraries used

| API / library | Used for |
| --- | --- |
| OpenStreetMap + Leaflet | Maps (sitter search map, live location) |
| OneMap | Singapore address lookup |
| Cloudinary | Photo uploads (pets, profiles, visit reports) |
| MapLibre + Turf.js | Walk routes, route recording, live location tracking, off-route checking |
| Google Calendar API | Calendar sync for sitters |
| Stripe (test mode) | Card payments |

## Tech stack

- **Client:** Vue 3, Vite, Vue Router, Bootstrap 5, Axios
- **Server:** Node.js, Express, MongoDB (Mongoose), express-session with connect-mongo
- **Tests:** Playwright
- **Hosting:** Vercel (client and server as two services in one project), MongoDB Atlas

## File structure

```
IS216-G10-T1/
├── vercel.json              Vercel setup: client + server services, /api routing, daily cron
├── client/                  Vue 3 + Vite frontend
│   ├── index.html
│   ├── vite.config.js       Dev server on 5173; forwards /api to the server on 5000
│   └── src/
│       ├── main.js          Entry point
│       ├── App.vue          Navbar + page outlet
│       ├── router/          Routes and the login / role guard
│       ├── views/           Pages (OwnerHome, SitterHome, BookingDetail, Session, Notifications, ...)
│       ├── components/      Reusable parts (NavBar, SessionCard, WalkMap, BookingTable, ...)
│       ├── services/        API calls (axios)
│       ├── utils/           Helpers (booking rules, GPS tracking, notifications, ...)
│       └── assets/          CSS and images
├── server/                  Express + MongoDB backend
│   ├── app.js               The Express app (used locally and on Vercel)
│   ├── server.js            Local starter: connects the database, starts background jobs, listens on 5000
│   └── src/
│       ├── config/          Database and Cloudinary setup
│       ├── models/          Mongoose schemas (User, Booking, VisitSession, Walk, Notification, ...)
│       ├── controllers/     Request handlers
│       ├── routes/          Express routers (all under /api)
│       ├── middleware/      Login checks, uploads, error handling
│       ├── utils/           Booking times, expiry, notifications, Google Calendar, ratings, ...
│       └── seed/            Demo data (seedDemo.js) and test data (e2e/)
└── e2e/                     Playwright end-to-end tests
    ├── playwright.config.js
    ├── e2eEnv.js            Test ports (5050 / 5174) and the test database name
    ├── global-setup.js      Resets the test database before every run
    └── tests/               Test files (*.spec.js) and shared helpers
```

## How to set up

### Prerequisites

- Node.js 18 or newer
- pnpm (`npm install -g pnpm`). npm also works for the client and server.
- A MongoDB database. A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works.
- For the full feature set: Cloudinary, Stripe (test mode) and Google Cloud (Calendar API) accounts.

### 1. Get the code

```bash
git clone https://github.com/ezenia22/IS216-G10-T1.git
cd IS216-G10-T1
```

### 2. Install dependencies

```bash
cd server && pnpm install
cd ../client && pnpm install
cd ../e2e && pnpm install      # only needed to run the tests
```

### 3. Create `server/.env`

`.env` files are git-ignored, so create this one yourself:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/petsociety
PORT=5000
SESSION_SECRET=<any long random string>
CLIENT_ORIGIN=http://localhost:5173

# Photo uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Calendar sync
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

# Payments (use a sk_test_ key)
STRIPE_SECRET_KEY=
```

Only `MONGO_URI` and `SESSION_SECRET` are needed to start the app. Without the others, photo uploads, calendar sync and payments won't work.

The client needs no `.env` for local use: in development, Vite forwards every `/api` request to `http://localhost:5000`.

### 4. (Optional) Load demo data

```bash
cd server
pnpm seed
```

This adds 4 owners and 12 sitters with full booking histories to the database in `MONGO_URI`. It only replaces `demo.*` accounts. All demo accounts use the password `Password123!`, for example `demo.claire@petsociety.com` (owner) and `demo.benny@petsociety.com` (sitter).

## How to run

Open two terminals.

**Terminal 1: server**

```bash
cd server
pnpm dev          # or: pnpm start
```

The API runs on http://localhost:5000. Check http://localhost:5000/api/health, which should answer `{"status":"ok"}`.

**Terminal 2: client**

```bash
cd client
pnpm dev
```

Open http://localhost:5173. Register a new account, or log in with a demo account.

### Deployment (Vercel)

The live site runs both apps in one Vercel project using Vercel Services (see `vercel.json`): `/api/*` goes to the server and everything else to the client. The project's Framework setting is "Services", and the same variables as `server/.env` are set in the Vercel project, plus `CRON_SECRET`, with `CLIENT_ORIGIN` and `GOOGLE_REDIRECT_URI` pointing to the live URL. Background jobs (expiring old requests, ending forgotten sessions, recalculating ratings) run once a day through the cron at `/api/cron/daily`. Each push to `main` deploys automatically.

## How to test

### Automated tests (Playwright)

**Setup (once):**

```bash
cd e2e
pnpm install
pnpm exec playwright install chromium
```

`server/.env` must have `MONGO_URI` (and `STRIPE_SECRET_KEY` for the payment test).

**Run:**

```bash
cd e2e
pnpm playwright test         # runs every test
pnpm exec playwright show-report       # show test results
```

**What a run does:**

- It never touches your own data. It uses a separate database, `petsociety_e2e`, on the same server as `MONGO_URI`.
- Before every run, `global-setup.js` runs `pnpm seed:e2e`, which resets that database to fixed test data (`server/src/seed/e2e/`).
- It starts its own server on port 5050 and client on port 5174, so your normal `pnpm dev` on 5000 / 5173 can keep running. Nothing else may be using 5050 or 5174.
- Tests run one at a time, because they share one database.
- The whole suite (183 tests, desktop Chrome plus an iPhone 6-sized screen) takes about 2 minutes. Keep the computer awake while it runs.

Test accounts in the test database (password `Password123!`): `seed.owner@petsociety.com`, `seed.sitter@petsociety.com`, `seed.sitter2@petsociety.com`.

### Main test cases

| ID | What it checks | File |
| --- | --- | --- |
| TC-01 | Log in with valid details and land on Home | `auth.spec.js` |
| TC-02 | Wrong password shows "Invalid login details." | `auth.spec.js` |
| TC-03 | Register a new owner account | `auth.spec.js` |
| TC-04 | A logged-out visitor is sent to the login page from My Bookings | `auth.spec.js` |
| TC-05 | Owner searches for a sitter and opens the booking form | `owner-bookings.spec.js` |
| TC-06 | An empty booking request is blocked | `owner-bookings.spec.js` |
| TC-07 | Owner sends a valid booking request at the right price | `owner-bookings.spec.js` |
| TC-08 | Sitter accepts a pending request | `sitter-requests.spec.js` |
| TC-09 | Sitter declines a pending request | `sitter-requests.spec.js` |
| TC-10 | Owner confirms a booking the sitter accepted | `owner-bookings.spec.js` |
| TC-11 | Pay now opens Stripe Checkout (test mode) | `payment.spec.js` |
| TC-12 | "Recommended for me" shows sitters that suit the owner's pets | `owner-bookings.spec.js` |
| TC-13 | Sitter sees payments received, filtered to Successful | `sitter-requests.spec.js` |
| TC-14 | Owner is notified when the sitter accepts | `notifications.spec.js` |
| TC-15 | On a phone, My Bookings tabs become a dropdown | `responsive.spec.js` |

### Edge-case tests

| File | What it covers |
| --- | --- |
| `edge-access.spec.js` | Login required (401), owner-only and sitter-only pages and APIs (403), menus per role, other people's bookings |
| `edge-accounts.spec.js` | Sign-up rules, password checklist, log in by username, 7-day login cookie, log out, change password, landing page |
| `edge-availability.spec.js` | Sitter calendar rules: invalid or past dates, hours outside 7 am to 12 am, one bad day stops the whole save |
| `edge-booking-create.spec.js` | Booking form checks, every server rule for a request, sitter availability and clashes, server-side pricing, several days with different hours |
| `edge-booking-lifecycle.spec.js` | Accept, decline, confirm, withdraw and cancel rules, double-booking a pet, expired requests |
| `edge-care-details.spec.js` | Care details only on confirmed bookings, field limits, locked once a session starts |
| `edge-chat.spec.js` | Chat message limits, who can read and send, read-only after payment |
| `edge-notifications.spec.js` | Notification rules, mark all as read, empty state, request-sent copy |
| `edge-payments-reviews.spec.js` | Pay only when completed, no paying twice, cancelled-at-Stripe page, review rules and rating update |
| `edge-profiles-pets.spec.js` | Profile and address rules, badges, pet rules, photo type and size limits |
| `edge-search.spec.js` | Name search, no private data in the sitter list, logged-out browsing, new-owner hints |
| `edge-sessions-walks.spec.js` | A full session: start at home (GPS check), tasks, walks, ending with a report, payment due, starting away from home with a note |
| `edge-walk-routes.spec.js` | Recording routes: name, points, must start and end at home, other owners can't see them |

### Manual test on the live site

Use the test accounts above at https://is216-g10-t1.vercel.app/. Use two browsers (or one normal and one private window) to be logged in as both at once.

1. **Owner:** log in as `caitlynnn`. Search for `kieranSitter` on Home, open the profile and press Request Booking. Pick a pet, a day and hours the sitter is free, add a care task, and send.
2. **Sitter:** log in as `kieranSitter`. Open Booking Requests and accept the request. The owner gets a notification.
3. **Owner:** confirm the booking under My Bookings → To confirm, and fill in the care details.
4. **Sitter:** on the booking's day, open Session and start it at the owner's address. The owner gets "Session started". Tick the tasks, then end the session with a short note.
5. **Owner:** open My Bookings → To pay, press Pay now, and pay with Stripe's test card `4242 4242 4242 4242` (any future expiry date and any CVC). Then leave a review.

The live site uses Stripe in test mode, so no real money is charged.
