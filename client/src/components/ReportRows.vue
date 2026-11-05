<script setup>
// One booking's care report rows: one row per day that had a session, newest first.
// Tapping a row emits `open` with that day's place in entry.days, for the visit report window.
// Used in the owner's "Recently ended" cards (Session page) and the "Visit reports" card on Booking Detail.
// `entry` is one report entry from the server (server/src/utils/visitReports.js).
import { computed } from 'vue'
import { dayLabel, summarize, timeOf } from '../utils/visitReport.js'

const props = defineProps({
  entry: { type: Object, required: true }
})
const emit = defineEmits(['open'])

const rows = computed(() => {
  const e = props.entry
  return e.days.map((day, index) => {
    const s = summarize(day, e.booking.pets)
    return {
      index,
      day,
      times: `${timeOf(day.visit.startedAt)} – ${day.visit.endedAt ? timeOf(day.visit.endedAt) : '…'}`,
      count: `${s.done}/${s.expected}`,
      photos: s.photos.length,
      walks: s.walks.length,
      warning: s.warn.length ? `${s.warn[0].short}${s.warn.length > 1 ? ` +${s.warn.length - 1}` : ''}` : '',
      last: day.dayNumber === e.totalDays
    }
  }).reverse()
})
const count = computed(() => props.entry.days.length)
</script>

<template>
  <div class="rr">
    <p class="rr-label">Care reports · {{ count }} session{{ count === 1 ? '' : 's' }}<span class="rr-hint"> · Tap a row for the full report</span></p>
    <!-- the rows go in their own list so a parent grid can line the label and the rows up separately -->
    <div class="rr-list">
      <button v-for="r in rows" :key="r.day.date" type="button" class="rr-row" @click="emit('open', r.index)">
        <span class="rr-row__date">
          <strong>{{ dayLabel(r.day.date) }}</strong>
          <small>Day {{ r.day.dayNumber }}<span class="rr-wide"> of {{ entry.totalDays }}</span>{{ r.last ? ' · last' : '' }}</small>
        </span>
        <strong class="rr-row__count">{{ r.count }}</strong>
        <!-- times and icons share a line when the row is narrow; on a wide row each gets its own column -->
        <span class="rr-row__info">
          <span class="rr-row__times">{{ r.times }}</span>
          <span v-if="r.photos || r.walks || r.warning" class="rr-row__meta">
            <span v-if="r.photos" class="rr-icon" :aria-label="`${r.photos} photos`">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /></svg>{{ r.photos }}
            </span>
            <span v-if="r.walks" class="rr-icon" :aria-label="`${r.walks} walks`">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M13 4a1.5 1.5 0 1 0 0 .01M10 21l2-6-3-3 2-4 3 2 3 1M7 13l1-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>{{ r.walks }}
            </span>
            <span v-if="r.warning" class="rr-warn">⚠ {{ r.warning }}</span>
          </span>
        </span>
        <span class="rr-row__go" aria-hidden="true">›</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* The rows react to the width of their own column (a container query), not the window,
   so they fit whether they sit in a wide card, half of Recently ended, or a phone */
.rr {
  min-width: 0; /* no container on .rr itself: containment would stop it being a subgrid in Recently ended */
}
.rr-label {
  margin: 0 0 0.6rem;
  color: #5c524b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.rr-list {
  container: rr / inline-size;
  display: grid;
  gap: 0.7rem;
}
/* narrow: two lines on the left ("Tue 3 Nov · Day 3 · last", then times, photos, walks and any warning);
   7/7 and › span both lines on the right, so they sit centred side by side */
.rr-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3rem 1rem;
  grid-template-areas:
    "date count go"
    "info count go";
  align-items: center;
  gap: 0.25rem 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e6dcd3;
  border-radius: 10px;
  background: #fff;
  color: #2b2420;
  text-align: left;
}
.rr-row:hover {
  border-color: var(--accent-main);
}
.rr-row:focus-visible {
  outline: 3px solid var(--accent-deep);
  outline-offset: 2px;
}
.rr-row__date {
  grid-area: date;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.4rem;
  min-width: 0;
  line-height: 1.25;
}
.rr-row__date small::before {
  content: '· ';
}
.rr-row__date small,
.rr-row__times {
  color: #6b5f56;
  font-size: 0.85rem;
}
.rr-hint,
.rr-wide {
  display: none;
}
/* the hint only fits on one line with the label on wide screens */
@media (min-width: 1200px) {
  .rr-hint {
    display: inline;
  }
}
.rr-row__count {
  grid-area: count;
  text-align: right;
}
.rr-row__info {
  grid-area: info;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.75rem;
  min-width: 0;
}
.rr-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.7rem;
  min-width: 0;
}
.rr-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: #6b5f56;
  font-size: 0.85rem;
}
.rr-warn {
  color: #7a5a00;
  font-size: 0.85rem;
  font-weight: 800;
  overflow-wrap: anywhere; /* wraps inside the row instead of running out of it */
}
.rr-row__go {
  grid-area: go;
  color: #6b5f56;
  font-size: 1.3rem;
  text-align: right;
}

/* wide (580px or more): one line per row, in fixed columns so dates, times and counts line up down the list */
@container rr (min-width: 580px) {
  .rr-wide {
    display: inline;
  }
  .rr-row {
    grid-template-columns: 7.5rem 9rem 3rem minmax(0, 1fr) 1rem;
    grid-template-areas: "date times count meta go";
    gap: 0.6rem;
  }
  .rr-row__date {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0;
  }
  .rr-row__date small::before {
    content: none;
  }
  .rr-row__info {
    display: contents;
  }
  .rr-row__times {
    grid-area: times;
  }
  .rr-row__meta {
    grid-area: meta;
  }
  .rr-row__count {
    text-align: left;
  }
}
</style>
