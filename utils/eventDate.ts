// Work out whether an event has already happened, so finished events stop
// offering a registration / join link.
//
// Editors type event dates by hand, in whatever shape reads well on the page
// ("Dec 9, 2026", "Feb 26 12:00pm - 2:00pm"). That means we cannot trust the
// text to parse, so the rule here is FAIL OPEN: anything we can't read with
// certainty — above all a date with no year on it — counts as still upcoming.
// Showing a link a day too long is a nuisance; hiding one for a live event
// loses us attendees.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** The site's audience is Ontario, and event times are written in ET. */
export const SITE_TZ = 'America/Toronto'

export interface EventLike {
  date?: string
  /** Day/month badge the editor derives from `date` — used as a fallback. */
  day?: string
  month?: string
}

/**
 * An event's calendar day as a sortable "YYYY-MM-DD", or '' when we can't tell.
 * Zero-padded ISO dates compare correctly as plain strings, which keeps the
 * comparison free of timezone-offset arithmetic.
 */
export function eventYmd(event: EventLike | null | undefined): string {
  const tokens = String(event?.date || '')
    .trim()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  // A year is non-negotiable. "Feb 26" could be this year or next, and guessing
  // either way can hide an event that hasn't happened yet.
  let year = ''
  for (const tk of tokens) {
    if (/^\d{4}$/.test(tk) && Number(tk) >= 1970 && Number(tk) <= 2999) {
      year = tk
      break
    }
  }
  if (!year) return ''

  let monthIdx = -1
  let day = 0
  for (const tk of tokens) {
    if (monthIdx < 0 && tk.length >= 3) {
      const i = MONTHS.indexOf(tk.slice(0, 3).toLowerCase())
      if (i >= 0) {
        monthIdx = i
        continue
      }
    }
    // Only a bare number is a day: "12:00pm" and "2026" must not qualify.
    if (!day && /^\d{1,2}$/.test(tk)) {
      const n = Number(tk)
      if (n >= 1 && n <= 31) day = n
    }
  }

  // Fall back to the badge fields the editor already worked out.
  if (monthIdx < 0 && event?.month) {
    monthIdx = MONTHS.indexOf(String(event.month).slice(0, 3).toLowerCase())
  }
  if (!day && event?.day) {
    const n = parseInt(String(event.day), 10)
    if (n >= 1 && n <= 31) day = n
  }

  if (monthIdx < 0 || !day) return ''
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Today's date in Toronto, as "YYYY-MM-DD". */
export function todayYmd(tz: string = SITE_TZ): string {
  try {
    // en-CA formats as YYYY-MM-DD, which is exactly what we compare against.
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    // A browser without the tz database still gets sensible local behaviour.
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
}

/**
 * Has the event's day finished?
 *
 * The whole event day counts as upcoming, so a 7–8 PM ET call keeps its link
 * right through the call itself. Pass `today` in from a caller that only
 * computes it in the browser: the site is prerendered, so a build-time "today"
 * would freeze at the last deploy.
 */
export function isEventOver(event: EventLike | null | undefined, today: string): boolean {
  if (!today) return false
  const ymd = eventYmd(event)
  if (!ymd) return false
  return ymd < today
}
