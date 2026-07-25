// Declarative description of every editable content file. The generic editor
// (pages/admin/[section].vue + components/AdminField.vue) renders forms from this —
// adding a new editable field is a change here, not new UI code.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'html' // prose that may contain inline markup (<em>, <strong>, <a>); rendered with v-html on the site
  | 'number'
  | 'boolean'
  | 'select'
  | 'image'
  | 'object'
  | 'list'

export interface Field {
  key: string
  label: string
  type: FieldType
  help?: string
  options?: string[] // for 'select'
  fields?: Field[] // for 'object' and 'list' (the per-item fields, when items are objects)
  itemType?: 'text' | 'textarea' // for 'list' of plain strings (no per-item fields)
  itemLabelKey?: string // for 'list' of objects: which sub-field to show as each row's title
  addLabel?: string // for 'list'
}

export interface Section {
  key: string // URL segment + id
  label: string
  file: string // path in the repo, e.g. content/challenges.json
  description?: string
  fields: Field[]
}

// ---- defaults / normalization so the editor can assume the full shape exists ----
function defaultFor(f: Field): unknown {
  switch (f.type) {
    case 'boolean':
      return false
    case 'number':
      return 0
    case 'select':
      return f.options?.[0] ?? ''
    case 'object':
      return blankFromFields(f.fields || [])
    case 'list':
      return []
    default:
      return ''
  }
}

export function blankFromFields(fields: Field[]): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  for (const f of fields) o[f.key] = defaultFor(f)
  return o
}

/** Ensure every schema-declared key exists (non-destructive: unknown keys are preserved). */
export function normalize(data: unknown, fields: Field[]): Record<string, any> {
  const out: Record<string, any> =
    data && typeof data === 'object' ? (data as Record<string, any>) : {}
  for (const f of fields) {
    if (f.type === 'object') {
      out[f.key] = normalize(out[f.key], f.fields || [])
    } else if (f.type === 'list') {
      if (!Array.isArray(out[f.key])) out[f.key] = []
      // Only normalize object-item lists; leave lists of plain strings as-is.
      if (f.fields && f.fields.length) {
        out[f.key] = out[f.key].map((it: unknown) => normalize(it, f.fields || []))
      }
    } else if (out[f.key] === undefined) {
      out[f.key] = defaultFor(f)
    }
  }
  return out
}

const seoField: Field = {
  key: 'seo',
  label: 'Search / social (SEO)',
  type: 'object',
  fields: [
    { key: 'title', label: 'Browser tab title', type: 'text' },
    { key: 'description', label: 'Search-result description', type: 'textarea' },
  ],
}

// Small helper: a call-to-action / link object with a label and href, used all over the site.
function ctaField(key: string, label: string): Field {
  return {
    key,
    label,
    type: 'object',
    fields: [
      { key: 'label', label: 'Button label', type: 'text' },
      { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
    ],
  }
}

export const sections: Section[] = [
  {
    key: 'site',
    label: 'Site-wide (nav & footer)',
    file: 'content/site.json',
    description: 'The top navigation, the header button, and everything in the footer — shown on every page.',
    fields: [
      {
        key: 'nav',
        label: 'Top navigation links',
        type: 'list',
        itemLabelKey: 'label',
        addLabel: 'Add a nav link',
        fields: [
          { key: 'label', label: 'Link text', type: 'text' },
          { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
          { key: 'order', label: 'Sort order', type: 'number' },
        ],
      },
      ctaField('cta', 'Header button'),
      {
        key: 'footer',
        label: 'Footer',
        type: 'object',
        fields: [
          { key: 'brandName', label: 'Organization name', type: 'text' },
          { key: 'tagline', label: 'Tagline', type: 'textarea' },
          {
            key: 'explore',
            label: '"Explore" column',
            type: 'object',
            fields: [
              { key: 'heading', label: 'Column heading', type: 'text' },
              {
                key: 'links',
                label: 'Links',
                type: 'list',
                itemLabelKey: 'label',
                addLabel: 'Add a link',
                fields: [
                  { key: 'label', label: 'Link text', type: 'text' },
                  { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
                ],
              },
            ],
          },
          {
            key: 'getInvolved',
            label: '"Get involved" column',
            type: 'object',
            fields: [
              { key: 'heading', label: 'Column heading', type: 'text' },
              {
                key: 'links',
                label: 'Links',
                type: 'list',
                itemLabelKey: 'label',
                addLabel: 'Add a link',
                fields: [
                  { key: 'label', label: 'Link text', type: 'text' },
                  { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
                ],
              },
            ],
          },
          {
            key: 'contact',
            label: '"Contact" column',
            type: 'object',
            fields: [
              { key: 'heading', label: 'Column heading', type: 'text' },
              { key: 'email', label: 'Contact email', type: 'text' },
              { key: 'location', label: 'Location', type: 'text' },
            ],
          },
          { key: 'copyright', label: 'Copyright line', type: 'text' },
          { key: 'credit', label: 'Credit line', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'home',
    label: 'Home page',
    file: 'content/home.json',
    description:
      'The landing page: hero, stats, marquee, mission, the section overview, the featured event, and the contact + newsletter bands.',
    fields: [
      seoField,
      {
        key: 'hero',
        label: 'Hero',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow (small label above the title)', type: 'text' },
          {
            key: 'title',
            label: 'Headline',
            type: 'html',
            help: 'Wrap words in <em>…</em> to give them the italic accent style.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
          ctaField('primaryCta', 'Primary button'),
          ctaField('secondaryCta', 'Secondary button'),
        ],
      },
      {
        key: 'stats',
        label: 'Hero stats',
        type: 'list',
        itemLabelKey: 'num',
        addLabel: 'Add a stat',
        fields: [
          { key: 'num', label: 'Big number (e.g. 2.8M)', type: 'text' },
          { key: 'label', label: 'Description', type: 'textarea' },
        ],
      },
      {
        key: 'marquee',
        label: 'Scrolling marquee terms',
        type: 'list',
        itemType: 'text',
        addLabel: 'Add a term',
      },
      {
        key: 'mission',
        label: 'Mission band',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          ctaField('cta', 'Button'),
          {
            key: 'text',
            label: 'Mission statement',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
        ],
      },
      {
        key: 'overviewHead',
        label: 'Overview section heading',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'sub', label: 'Subheading', type: 'textarea' },
        ],
      },
      {
        key: 'overview',
        label: 'Section overview cards',
        type: 'list',
        itemLabelKey: 'tag',
        addLabel: 'Add a card',
        fields: [
          { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
          { key: 'idx', label: 'Index number (e.g. 01)', type: 'text' },
          {
            key: 'imgClass',
            label: 'Image CSS class',
            type: 'text',
            help: 'Controls the placeholder gradient (e.g. ov-img-2). Leave blank for the default.',
          },
          { key: 'visualTag', label: 'Image tag label', type: 'text' },
          { key: 'tag', label: 'Category tag', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'count', label: 'Count number (e.g. 6)', type: 'text' },
          { key: 'countLabel', label: 'Count label', type: 'text' },
          { key: 'metaAriaLabel', label: 'Accessibility label for the count', type: 'text' },
        ],
      },
      {
        key: 'featuredEvent',
        label: 'Featured event band',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          { key: 'meta', label: 'Description', type: 'textarea' },
          ctaField('primaryCta', 'Primary button'),
          ctaField('secondaryCta', 'Secondary button'),
          { key: 'cardAriaLabel', label: 'Accessibility label for the date card', type: 'text' },
          { key: 'savedateLabel', label: '"Save the date" label', type: 'text' },
          { key: 'monthLabel', label: 'Month label', type: 'text' },
          { key: 'locationLabel', label: 'Location label', type: 'text' },
        ],
      },
      {
        key: 'contactBand',
        label: 'Contact band',
        type: 'object',
        fields: [
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
          { key: 'email', label: 'Contact email', type: 'text' },
        ],
      },
      {
        key: 'newsletter',
        label: 'Newsletter signup',
        type: 'object',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'body', label: 'Body text', type: 'textarea' },
          { key: 'placeholder', label: 'Email field placeholder', type: 'text' },
          { key: 'submitLabel', label: 'Subscribe button label', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'stories',
    label: 'Patient stories',
    file: 'content/stories.json',
    description:
      'The stories listing page, the individual story articles, and the "share your story" call-to-action.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'filters',
        label: 'Filter buttons',
        type: 'list',
        itemType: 'text',
        addLabel: 'Add a filter',
      },
      {
        key: 'shareCta',
        label: '"Share your story" band',
        type: 'object',
        fields: [
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'body', label: 'Body text', type: 'textarea' },
          ctaField('cta', 'Button'),
        ],
      },
      {
        key: 'stories',
        label: 'Stories',
        type: 'list',
        itemLabelKey: 'authorName',
        addLabel: 'Add a story',
        fields: [
          { key: 'id', label: 'ID (unique number)', type: 'number' },
          {
            key: 'slug',
            label: 'URL slug',
            type: 'text',
            help: 'Used in the page address, e.g. maya-nakamura.',
          },
          { key: 'category', label: 'Category', type: 'text' },
          {
            key: 'filterKey',
            label: 'Filter category',
            type: 'text',
            help: 'Must match one of the filter buttons above (e.g. Caregivers) for filtering to work.',
          },
          { key: 'readTime', label: 'Read time (e.g. 9 min read)', type: 'text' },
          { key: 'imgClass', label: 'Image CSS class', type: 'text' },
          { key: 'imgLabel', label: 'Image caption', type: 'text' },
          { key: 'imgGradient', label: 'Image gradient (CSS)', type: 'text' },
          { key: 'title', label: 'Headline', type: 'textarea' },
          { key: 'quote', label: 'Pull quote', type: 'textarea' },
          { key: 'initials', label: 'Author initials', type: 'text' },
          { key: 'authorName', label: 'Author name', type: 'text' },
          { key: 'authorRole', label: 'Author role', type: 'text' },
          {
            key: 'body',
            label: 'Story body',
            type: 'textarea',
            help: 'Separate paragraphs with a blank line.',
          },
        ],
      },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    file: 'content/events.json',
    description: 'Upcoming and past events, plus the registration form labels and options.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      { key: 'upcomingLabel', label: '"Upcoming events" label', type: 'text' },
      {
        key: 'upcoming',
        label: 'Upcoming events',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add an event',
        fields: [
          { key: 'day', label: 'Day (e.g. 21)', type: 'text' },
          { key: 'month', label: 'Month (e.g. May)', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'time', label: 'Time (e.g. 7:00–8:30 PM ET)', type: 'text' },
          { key: 'tag', label: 'Format', type: 'select', options: ['ZOOM', 'IRL'] },
          { key: 'date', label: 'Full date (e.g. May 21, 2026)', type: 'text' },
          { key: 'featured', label: 'Feature on the home page', type: 'boolean' },
        ],
      },
      {
        key: 'pastHead',
        label: 'Past events heading',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'sub', label: 'Subheading', type: 'textarea' },
        ],
      },
      {
        key: 'past',
        label: 'Past events',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a past event',
        fields: [
          { key: 'date', label: 'Date (e.g. Mar 18, 2026)', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
        ],
      },
      {
        key: 'registration',
        label: 'Registration form',
        type: 'object',
        fields: [
          { key: 'eyebrowPrefix', label: 'Eyebrow prefix', type: 'text' },
          { key: 'zoomLabel', label: 'Zoom event label', type: 'text' },
          { key: 'inPersonLabel', label: 'In-person event label', type: 'text' },
          { key: 'emailPlaceholder', label: 'Email field placeholder', type: 'text' },
          { key: 'rolePlaceholder', label: 'Role dropdown placeholder', type: 'text' },
          {
            key: 'roleOptions',
            label: 'Role options',
            type: 'list',
            itemType: 'text',
            addLabel: 'Add a role',
          },
          { key: 'calendarInvite', label: 'Calendar-invite checkbox label', type: 'textarea' },
          { key: 'submit', label: 'Submit button label', type: 'text' },
          {
            key: 'success',
            label: 'Success message',
            type: 'object',
            fields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'body', label: 'Body text', type: 'textarea' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'challenges',
    label: 'Challenges',
    file: 'content/challenges.json',
    description: 'The numbered challenges list, the pull quote, and the call-to-action band.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> to give them the italic accent style.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'challenges',
        label: 'Challenges',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a challenge',
        fields: [
          { key: 'num', label: 'Number (e.g. 01)', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'stat', label: 'Big stat (e.g. 5.6 yrs)', type: 'text' },
          { key: 'statLabel', label: 'Stat label', type: 'text' },
        ],
      },
      {
        key: 'quote',
        label: 'Pull quote',
        type: 'object',
        fields: [
          {
            key: 'text',
            label: 'Quote',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'attribution', label: 'Attribution', type: 'text' },
        ],
      },
      {
        key: 'ctaBand',
        label: 'Call-to-action band',
        type: 'object',
        fields: [
          { key: 'heading', label: 'Heading', type: 'html' },
          { key: 'body', label: 'Body text', type: 'textarea' },
          {
            key: 'actions',
            label: 'Buttons',
            type: 'list',
            itemLabelKey: 'label',
            addLabel: 'Add a button',
            fields: [
              { key: 'label', label: 'Button label', type: 'text' },
              { key: 'href', label: 'Link (a /path or full URL)', type: 'text' },
              { key: 'style', label: 'Style', type: 'select', options: ['dark', 'outline-ink'] },
              { key: 'arrow', label: 'Show arrow →', type: 'boolean' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'advocacy',
    label: 'Advocacy',
    file: 'content/advocacy.json',
    description: 'The advocacy goals, the progress tracker, and the closing call-to-action band.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'goals',
        label: 'Advocacy goals',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a goal',
        fields: [
          { key: 'num', label: 'Number (e.g. 01)', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'status', label: 'Status label', type: 'text' },
          {
            key: 'statusClass',
            label: 'Status style (CSS class)',
            type: 'text',
            help: 'Leave blank, or use pill-draft / pill-open to change the badge colour.',
          },
          {
            key: 'points',
            label: 'Key points',
            type: 'list',
            itemType: 'text',
            addLabel: 'Add a point',
          },
        ],
      },
      {
        key: 'progressHead',
        label: 'Progress tracker heading',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'sub', label: 'Subheading', type: 'textarea' },
        ],
      },
      {
        key: 'progress',
        label: 'Progress items',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a progress item',
        fields: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'meta', label: 'Subtitle / where it stands', type: 'text' },
          { key: 'status', label: 'Status label', type: 'text' },
          {
            key: 'statusClass',
            label: 'Status style (CSS class)',
            type: 'text',
            help: 'pr-progress, pr-open, or pr-win change the badge colour.',
          },
        ],
      },
      {
        key: 'ctaBand',
        label: 'Call-to-action band',
        type: 'object',
        fields: [
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Body text', type: 'textarea' },
          ctaField('primaryCta', 'Primary button'),
          ctaField('secondaryCta', 'Secondary button'),
        ],
      },
    ],
  },
  {
    key: 'videos',
    label: 'Videos',
    file: 'content/videos.json',
    description: 'The video library: filters, the featured video, and the two grids of additional videos.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'filters',
        label: 'Filter buttons',
        type: 'list',
        itemType: 'text',
        addLabel: 'Add a filter',
      },
      {
        key: 'featured',
        label: 'Featured video',
        type: 'object',
        fields: [
          { key: 'cat', label: 'Category', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'dur', label: 'Duration / meta (e.g. 42 min · Recorded Mar 2026)', type: 'text' },
          { key: 'ariaLabel', label: 'Accessibility label', type: 'text' },
        ],
      },
      {
        key: 'sideVideos',
        label: 'Side videos',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a video',
        fields: [
          { key: 'cls', label: 'Thumbnail CSS class', type: 'text' },
          { key: 'cat', label: 'Category', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'dur', label: 'Duration (e.g. 8 min)', type: 'text' },
        ],
      },
      {
        key: 'moreVideos',
        label: 'More videos',
        type: 'list',
        itemLabelKey: 'title',
        addLabel: 'Add a video',
        fields: [
          { key: 'cls', label: 'Thumbnail CSS class', type: 'text' },
          { key: 'cat', label: 'Category', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'dur', label: 'Duration (e.g. 19 min)', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'partners',
    label: 'Partners',
    file: 'content/partners.json',
    description: 'The affiliated-organization groups and their partners, plus the "become a partner" band.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'partnerGroups',
        label: 'Partner groups',
        type: 'list',
        itemLabelKey: 'label',
        addLabel: 'Add a group',
        fields: [
          { key: 'label', label: 'Group heading', type: 'text' },
          {
            key: 'partners',
            label: 'Partners',
            type: 'list',
            itemLabelKey: 'name',
            addLabel: 'Add a partner',
            fields: [
              { key: 'abbr', label: 'Abbreviation / logo text', type: 'text' },
              { key: 'region', label: 'Region', type: 'text' },
              { key: 'name', label: 'Organization name', type: 'text' },
              { key: 'focus', label: 'Focus / description', type: 'textarea' },
            ],
          },
        ],
      },
      {
        key: 'becomePartner',
        label: '"Become a partner" band',
        type: 'object',
        fields: [
          {
            key: 'title',
            label: 'Title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'body', label: 'Body text', type: 'textarea' },
          ctaField('cta', 'Button'),
        ],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact',
    file: 'content/contact.json',
    description:
      'The contact form (labels, dropdown options, success message), the newsletter band, and the form-service key.',
    fields: [
      seoField,
      {
        key: 'header',
        label: 'Page header',
        type: 'object',
        fields: [
          { key: 'crumb', label: 'Breadcrumb label', type: 'text' },
          {
            key: 'title',
            label: 'Page title',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
        ],
      },
      {
        key: 'form',
        label: 'Contact form',
        type: 'object',
        fields: [
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          { key: 'title', label: 'Form title', type: 'text' },
          { key: 'sub', label: 'Subtitle', type: 'textarea' },
          { key: 'emailPlaceholder', label: 'Email field placeholder', type: 'text' },
          { key: 'rolePlaceholder', label: 'Role dropdown placeholder', type: 'text' },
          {
            key: 'roleOptions',
            label: 'Role options',
            type: 'list',
            itemType: 'text',
            addLabel: 'Add a role',
          },
          { key: 'topicPlaceholder', label: 'Topic dropdown placeholder', type: 'text' },
          {
            key: 'topicOptions',
            label: 'Topic options',
            type: 'list',
            itemType: 'text',
            addLabel: 'Add a topic',
          },
          { key: 'messagePlaceholder', label: 'Message field placeholder', type: 'text' },
          { key: 'submit', label: 'Submit button label', type: 'text' },
          { key: 'sending', label: 'Sending button label', type: 'text' },
          {
            key: 'success',
            label: 'Success message',
            type: 'object',
            fields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'body', label: 'Body text', type: 'textarea' },
            ],
          },
        ],
      },
      {
        key: 'newsletter',
        label: 'Newsletter band',
        type: 'object',
        fields: [
          {
            key: 'heading',
            label: 'Heading',
            type: 'html',
            help: 'Wrap words in <em>…</em> for the italic accent.',
          },
          { key: 'body', label: 'Body text', type: 'textarea' },
          { key: 'placeholder', label: 'Email field placeholder', type: 'text' },
          { key: 'submitLabel', label: 'Subscribe button label', type: 'text' },
        ],
      },
      {
        key: 'web3formsKey',
        label: 'Web3Forms access key',
        type: 'text',
        help: 'The API key that delivers form submissions. Only change this if you regenerate the key.',
      },
    ],
  },
  {
    key: 'coming-soon',
    label: 'Coming-soon page',
    file: 'content/coming-soon.json',
    description: 'The standalone launch page: headline, signup form, and the Mailchimp connection.',
    fields: [
      seoField,
      { key: 'orgName', label: 'Organization name', type: 'text' },
      {
        key: 'headline',
        label: 'Headline',
        type: 'html',
        help: 'Use <em>…</em> for the italic accent and <br> for a line break.',
      },
      { key: 'lede', label: 'Intro paragraph', type: 'textarea' },
      { key: 'placeholder', label: 'Email field placeholder', type: 'text' },
      { key: 'submitLabel', label: 'Signup button label', type: 'text' },
      { key: 'successText', label: 'Success message', type: 'text' },
      { key: 'contactEmail', label: 'Contact email', type: 'text' },
      {
        key: 'mailchimp',
        label: 'Mailchimp connection',
        type: 'object',
        fields: [
          { key: 'url', label: 'Subscribe endpoint URL', type: 'text' },
          { key: 'u', label: 'Audience "u" value', type: 'text' },
          { key: 'id', label: 'List ID', type: 'text' },
        ],
      },
    ],
  },
]

export function getSection(key: string): Section | undefined {
  return sections.find((s) => s.key === key)
}
