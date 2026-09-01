// The "task engine" for the task-first admin editor.
//
// This is a pure-logic module: it owns the four guided "tasks" (event, story,
// partner, media), the wizard field definitions copied from the design, and the
// functions that turn a wizard's collected `vals` into NEW content-data objects.
//
// The UI never mutates content directly — it reads items with readItems(),
// builds a new content object with applyItem()/removeItem(), then hands that to
// useDrafts().stageChange(fileFor(task), newContent, changeLabel(...)).
//
// EVERY function here works on an immutable clone and never mutates its argument.

export type TaskKey = 'event' | 'story' | 'partner' | 'media'

export interface TaskField {
  key: string
  label: string
  kind: 'text' | 'area' | 'rich' | 'choice' | 'image'
  required?: boolean
  placeholder?: string
  help?: string
  choices?: string[]
}

export interface TaskStep {
  q: string
  review?: boolean
  fields: TaskField[]
}

export interface TaskConfig {
  key: TaskKey
  tile: string
  glyph: string
  desc: string
  pickTitle: string
  pickDesc: string
  newLabel: string
  existing: string
  newTitle: string
  editTitle: string
  done: string
  file: string
  steps: TaskStep[]
}

// An item as shown on the "pick / existing items" list.
export interface TaskItem {
  big: string
  small: string
  title: string
  meta: string
  vals: Record<string, string>
  // ref = how to locate this item inside its content file:
  //   event   -> { index }
  //   story   -> { index }
  //   partner -> { group, index }
  //   media   -> { index }
  ref: any
}

// ---------------------------------------------------------------------------
// Task definitions — tile text, glyphs, questions, fields, choices, placeholders
// and help are copied verbatim from the design handoff prototype
// (Website Editor.dc.html, `this.tasks`). `key` and `file` are added for the engine.
// ---------------------------------------------------------------------------

export const tasks: Record<TaskKey, TaskConfig> = {
  event: {
    key: 'event',
    file: 'content/events.json',
    tile: 'Add or change an event',
    glyph: '⊕', // ⊕
    desc: 'Put a new event on the Events page, or fix the details of one that’s already there.',
    pickTitle: 'Events',
    pickDesc: 'Add a new event, or change one you’ve already got.',
    newLabel: 'Add a new event',
    existing: 'Events already on the site',
    newTitle: 'Adding an event',
    editTitle: 'Changing an event',
    done: 'Your event is ready',
    steps: [
      {
        q: 'What is the event called?',
        fields: [
          {
            key: 'title',
            label: 'Event name',
            kind: 'text',
            required: true,
            placeholder: 'Rare Disease Day Town Hall',
            help: 'This is the big line people see on the Events page.',
          },
          {
            key: 'blurb',
            label: 'One or two sentences about it',
            kind: 'area',
            placeholder: 'A conversation with families and clinicians about…',
          },
        ],
      },
      {
        q: 'When is it, and how do people attend?',
        fields: [
          {
            key: 'date',
            label: 'Date',
            kind: 'text',
            required: true,
            placeholder: 'May 21, 2026',
            help: 'Write it however you like — “May 21, 2026” is what the rest of the site uses.',
          },
          { key: 'time', label: 'Time', kind: 'text', placeholder: '7:00 – 8:30 PM ET' },
          {
            key: 'format',
            label: 'How do people attend?',
            kind: 'choice',
            choices: ['Online (Zoom)', 'In person'],
          },
          {
            key: 'feature',
            label: 'Should this be the event shown on the home page?',
            kind: 'choice',
            choices: ['Yes', 'No'],
          },
        ],
      },
      { q: 'Here it is — does this look right?', review: true, fields: [] },
    ],
  },
  story: {
    key: 'story',
    file: 'content/stories.json',
    tile: 'Post a patient story',
    glyph: '“', // “
    desc: 'Publish someone’s story with their name, their role and the story itself.',
    pickTitle: 'Patient stories',
    pickDesc: 'Publish a new story, or change one that’s already up.',
    newLabel: 'Post a new story',
    existing: 'Stories already on the site',
    newTitle: 'Posting a story',
    editTitle: 'Changing a story',
    done: 'The story is ready',
    steps: [
      {
        q: 'Whose story is it?',
        fields: [
          { key: 'title', label: 'Their name', kind: 'text', required: true, placeholder: 'Maya Nakamura' },
          { key: 'time', label: 'Their role', kind: 'text', placeholder: 'Parent and caregiver' },
          {
            key: 'format',
            label: 'Which filter tab should it sit under?',
            kind: 'choice',
            choices: ['Caregiver', 'Patient', 'Clinician'],
          },
        ],
      },
      {
        q: 'Now the story itself.',
        fields: [
          {
            key: 'blurb',
            label: 'The headline of their story',
            kind: 'area',
            required: true,
            placeholder: 'Five years and eleven specialists before a diagnosis',
          },
          { key: 'body', label: 'The story', kind: 'rich' },
          { key: 'photo', label: 'A photo (optional)', kind: 'image' },
        ],
      },
      { q: 'Here it is — does this look right?', review: true, fields: [] },
    ],
  },
  partner: {
    key: 'partner',
    file: 'content/partners.json',
    tile: 'Add a partner organization',
    glyph: '◇', // ◇
    desc: 'Add an organization to the Partners page with their short name and website.',
    pickTitle: 'Partners',
    pickDesc: 'Add an organization, or update one you already list.',
    newLabel: 'Add a new partner',
    existing: 'Partners already on the site',
    newTitle: 'Adding a partner',
    editTitle: 'Changing a partner',
    done: 'The partner is ready',
    steps: [
      {
        q: 'Which organization?',
        fields: [
          {
            key: 'title',
            label: 'Organization name',
            kind: 'text',
            required: true,
            placeholder: 'Canadian Organization for Rare Disorders',
          },
          {
            key: 'small',
            label: 'Short name for the logo box',
            kind: 'text',
            placeholder: 'CORD',
            help: 'Three or four letters. It shows in the little square on the card.',
          },
        ],
      },
      {
        q: 'Tell people who they are.',
        fields: [
          {
            key: 'blurb',
            label: 'What they do',
            kind: 'area',
            placeholder: 'Canada’s national network for people with rare disorders.',
          },
          {
            key: 'date',
            label: 'Their website',
            kind: 'text',
            placeholder: 'https://…',
            help: 'Paste the whole address from your browser bar, starting with https://',
          },
          {
            key: 'format',
            label: 'Where are they based?',
            kind: 'choice',
            choices: ['Ontario', 'National', 'International'],
          },
        ],
      },
      { q: 'Here it is — does this look right?', review: true, fields: [] },
    ],
  },
  media: {
    key: 'media',
    file: 'content/media.json',
    tile: 'Add media coverage',
    glyph: '◈', // ◈
    desc: 'Paste a link to an article, interview or podcast episode and it appears on the Media page.',
    pickTitle: 'Media coverage',
    pickDesc: 'Add a piece of coverage, or change the details of one already listed.',
    newLabel: 'Add new coverage',
    existing: 'Coverage already on the site',
    newTitle: 'Adding media coverage',
    editTitle: 'Changing media coverage',
    done: 'The coverage is ready',
    steps: [
      {
        q: 'Paste the link to the coverage.',
        fields: [
          {
            key: 'date',
            label: 'Link',
            kind: 'text',
            required: true,
            placeholder: 'https://…',
            help: 'Copy the address from your browser bar while the article or episode is open.',
          },
          {
            key: 'title',
            label: 'Headline',
            kind: 'text',
            required: true,
            placeholder: 'New group launches to advocate for rare disease patients in Ontario',
          },
        ],
      },
      {
        q: 'A couple of details.',
        fields: [
          {
            key: 'time',
            label: 'Which publication or show?',
            kind: 'text',
            placeholder: 'BradfordToday',
          },
          {
            key: 'format',
            label: 'What kind of coverage is it?',
            kind: 'choice',
            choices: ['Article', 'TV', 'Radio', 'Podcast', 'Video'],
          },
        ],
      },
      { q: 'Here it is — does this look right?', review: true, fields: [] },
    ],
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DOT = ' · ' // " · "
const clone = <T>(v: T): T => (v == null ? v : JSON.parse(JSON.stringify(v)))

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Parse a free-text date like "May 21, 2026" into a padded day ("21") + 3-letter month ("May"). */
function parseEventDate(date: string): { day: string; month: string } {
  const tokens = String(date || '').replace(/,/g, ' ').split(/\s+/).filter(Boolean)
  let day = ''
  let month = ''
  for (const tk of tokens) {
    if (!month && tk.length >= 3) {
      const key = tk.slice(0, 3).toLowerCase()
      const m = MONTHS.find((mm) => mm.toLowerCase().startsWith(key))
      if (m) {
        month = m.slice(0, 3)
        continue
      }
    }
    if (!day) {
      const n = parseInt(tk, 10)
      if (String(n) === tk && n >= 1 && n <= 31) day = String(n).padStart(2, '0')
    }
  }
  return { day, month }
}

function slugify(s: string): string {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** First letter of the first two words, uppercased. e.g. "Maya Nakamura" -> "MN". */
function initialsOf(name: string): string {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

/** Initials from every word, up to 4 chars, uppercased. e.g. "Rare Disease Foundation" -> "RDF". */
function abbrOf(name: string): string {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

function wordCount(body: string): number {
  return String(body || '')
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

// ---------------------------------------------------------------------------
// readItems — derive the "existing items" list for a task from real content
// ---------------------------------------------------------------------------

export function readItems(task: TaskKey, content: any): TaskItem[] {
  const items: TaskItem[] = []

  if (task === 'event') {
    const arr: any[] = (content && content.upcoming) || []
    arr.forEach((e, index) => {
      items.push({
        big: e.day || '',
        small: e.month || '',
        title: e.title || '',
        meta: [e.date, e.tag === 'ZOOM' ? 'Online (Zoom)' : 'In person'].filter(Boolean).join(DOT),
        vals: {
          title: e.title || '',
          blurb: e.desc || '',
          date: e.date || '',
          time: e.time || '',
          format: e.tag === 'IRL' ? 'In person' : 'Online (Zoom)',
          feature: e.featured ? 'Yes' : 'No',
        },
        ref: { index },
      })
    })
  } else if (task === 'story') {
    const arr: any[] = (content && content.stories) || []
    arr.forEach((s, index) => {
      items.push({
        big: s.initials || '',
        small: '',
        title: s.authorName || '',
        meta: [s.category, s.readTime].filter(Boolean).join(DOT),
        vals: {
          title: s.authorName || '',
          time: s.authorRole || '',
          format: s.category || '',
          blurb: s.title || '',
          body: s.body || '',
          photo: s.image || '',
        },
        ref: { index },
      })
    })
  } else if (task === 'partner') {
    const groups: any[] = (content && content.partnerGroups) || []
    groups.forEach((g, group) => {
      const partners: any[] = (g && g.partners) || []
      partners.forEach((p, index) => {
        items.push({
          big: p.abbr || '',
          small: '',
          title: p.name || '',
          meta: p.region || '',
          vals: {
            title: p.name || '',
            small: p.abbr || '',
            blurb: p.focus || '',
            date: p.url || '',
            format: p.region || '',
          },
          ref: { group, index },
        })
      })
    })
  } else if (task === 'media') {
    ;((content && content.coverage) || []).forEach((m: any, index: number) =>
      items.push({
        big: '◈', // ◈
        small: m.type || '',
        title: m.title || '',
        meta: [m.type, m.outlet].filter(Boolean).join(DOT),
        vals: {
          date: m.url || '',
          title: m.title || '',
          time: m.outlet || '',
          format: m.type || '',
        },
        ref: { index },
      })
    )
  }

  return items
}

// ---------------------------------------------------------------------------
// applyItem — add (ref null) or update; returns a NEW content clone
// ---------------------------------------------------------------------------

function applyEvent(content: any, vals: Record<string, string>, ref: any): any {
  const c = clone(content) || {}
  if (!Array.isArray(c.upcoming)) c.upcoming = []
  const isEdit = ref && typeof ref.index === 'number'
  const { day, month } = parseEventDate(vals.date || '')

  const target: any = isEdit ? c.upcoming[ref.index] : {}
  target.day = day
  target.month = month
  target.title = vals.title || ''
  target.time = vals.time || ''
  target.tag = vals.format === 'In person' ? 'IRL' : 'ZOOM'
  target.date = vals.date || ''
  target.featured = vals.feature === 'Yes'
  target.desc = vals.blurb || ''

  // Only one upcoming event can be featured on the home page.
  if (target.featured) {
    c.upcoming.forEach((it: any, i: number) => {
      if (!(isEdit && i === ref.index)) it.featured = false
    })
  }

  if (!isEdit) c.upcoming.push(target)
  return c
}

function applyStory(content: any, vals: Record<string, string>, ref: any): any {
  const c = clone(content) || {}
  if (!Array.isArray(c.stories)) c.stories = []
  const isEdit = ref && typeof ref.index === 'number'
  const filterMap: Record<string, string> = {
    Caregiver: 'Caregivers',
    Patient: 'Patients',
    Clinician: 'Clinicians',
  }

  const target: any = isEdit ? c.stories[ref.index] : {}
  // Mapped fields
  target.authorName = vals.title || ''
  target.authorRole = vals.time || ''
  target.category = vals.format || ''
  target.filterKey = filterMap[vals.format] || vals.format || ''
  target.title = vals.blurb || '' // the story headline
  target.body = vals.body || ''
  target.image = vals.photo || '' // story photo; blank = colour fallback
  // Derived-from-content fields (safe to recompute on edit too)
  target.initials = initialsOf(target.authorName)
  target.imgLabel = 'Photo · ' + target.authorName
  target.readTime = `${Math.max(1, Math.round(wordCount(target.body) / 200))} min read`

  if (!isEdit) {
    const maxId = c.stories.reduce((m: number, s: any) => Math.max(m, Number(s.id) || 0), 0)
    target.id = maxId + 1

    // slug = kebab-case of the name, deduped against existing slugs
    const existing = new Set(c.stories.map((s: any) => s.slug))
    const base = slugify(target.authorName) || 'story'
    let slug = base
    let n = 2
    while (existing.has(slug)) slug = `${base}-${n++}`
    target.slug = slug

    target.imgClass = 's' + ((c.stories.length % 6) + 1) // round-robin s1..s6
    target.imgGradient = ''
    target.quote = ''
    c.stories.push(target)
  }
  return c
}

function applyPartner(content: any, vals: Record<string, string>, ref: any): any {
  const c = clone(content) || {}
  if (!Array.isArray(c.partnerGroups)) c.partnerGroups = []
  const isEdit = ref && typeof ref.group === 'number' && typeof ref.index === 'number'

  const buildInto = (target: any) => {
    target.abbr = vals.small && vals.small.trim() ? vals.small.trim() : abbrOf(vals.title)
    target.region = vals.format || ''
    target.name = vals.title || ''
    target.focus = vals.blurb || ''
    target.url = vals.date || ''
    return target
  }

  if (isEdit) {
    const grp = c.partnerGroups[ref.group]
    if (grp && Array.isArray(grp.partners) && grp.partners[ref.index]) {
      buildInto(grp.partners[ref.index])
    }
    return c
  }

  // Add: choose the destination group whose label, or any partner's region,
  // matches the chosen region (case-insensitive contains); else the first group.
  const fmt = (vals.format || '').toLowerCase()
  let gi = 0
  if (fmt) {
    const found = c.partnerGroups.findIndex(
      (g: any) =>
        String(g && g.label ? g.label : '').toLowerCase().includes(fmt) ||
        (Array.isArray(g && g.partners) &&
          g.partners.some((p: any) => String(p.region || '').toLowerCase().includes(fmt)))
    )
    if (found >= 0) gi = found
  }
  if (!c.partnerGroups[gi]) c.partnerGroups[gi] = { label: '', partners: [] }
  if (!Array.isArray(c.partnerGroups[gi].partners)) c.partnerGroups[gi].partners = []
  c.partnerGroups[gi].partners.push(buildInto({}))
  return c
}

function applyMedia(content: any, vals: Record<string, string>, ref: any): any {
  const c = clone(content) || {}
  if (!Array.isArray(c.coverage)) c.coverage = []

  const buildInto = (target: any) => {
    target.title = vals.title || ''
    target.outlet = vals.time || ''
    target.type = vals.format || ''
    target.url = vals.date || ''
    return target
  }

  const isEdit = ref && typeof ref.index === 'number'
  if (isEdit) {
    const target = c.coverage[ref.index]
    if (!target) return c
    buildInto(target)
    return c
  }

  // ADD — newest coverage goes to the top of the list.
  c.coverage.unshift(buildInto({}))
  return c
}

export function applyItem(
  task: TaskKey,
  content: any,
  vals: Record<string, string>,
  ref: any | null
): any {
  if (task === 'event') return applyEvent(content, vals, ref)
  if (task === 'story') return applyStory(content, vals, ref)
  if (task === 'partner') return applyPartner(content, vals, ref)
  return applyMedia(content, vals, ref)
}

// ---------------------------------------------------------------------------
// removeItem — returns a NEW content clone without the referenced item
// ---------------------------------------------------------------------------

export function removeItem(task: TaskKey, content: any, ref: any): any {
  const c = clone(content) || {}
  if (task === 'event') {
    if (Array.isArray(c.upcoming) && ref && typeof ref.index === 'number') c.upcoming.splice(ref.index, 1)
  } else if (task === 'story') {
    if (Array.isArray(c.stories) && ref && typeof ref.index === 'number') c.stories.splice(ref.index, 1)
  } else if (task === 'partner') {
    const grp = c.partnerGroups && c.partnerGroups[ref.group]
    if (grp && Array.isArray(grp.partners)) grp.partners.splice(ref.index, 1)
  } else if (task === 'media') {
    if (Array.isArray(c.coverage) && ref && typeof ref.index === 'number') c.coverage.splice(ref.index, 1)
  }
  return c
}

// ---------------------------------------------------------------------------
// preview — mirrors the prototype's live preview mapping
// ---------------------------------------------------------------------------

export function preview(
  task: TaskKey,
  vals: Record<string, string>
): { big: string; small: string; title: string; meta: string; body: string } {
  const meta = [vals.time, vals.format, vals.date].filter(Boolean).join(DOT)
  const title = vals.title || ''
  const body = vals.blurb || ''

  if (task === 'event') {
    const { day, month } = parseEventDate(vals.date || '')
    return { big: day, small: month, title, meta, body }
  }
  if (task === 'partner') {
    const big = vals.small && vals.small.trim() ? vals.small.trim() : abbrOf(vals.title)
    return { big, small: '', title, meta, body }
  }
  if (task === 'media') {
    return { big: '◈', small: vals.format || '', title, meta, body }
  }
  // story
  return { big: initialsOf(vals.title), small: '', title, meta, body }
}

// ---------------------------------------------------------------------------
// changeLabel / fileFor
// ---------------------------------------------------------------------------

export function changeLabel(task: TaskKey, vals: Record<string, string>, isEdit: boolean): string {
  return (isEdit ? 'Updated ' : 'Added ') + '"' + (vals.title || 'Untitled') + '"'
}

export function fileFor(task: TaskKey): string {
  return tasks[task].file
}
