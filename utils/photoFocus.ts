import focus from '~/content/focus.json'

// "Choose what shows" in the website editor: the part of a photo to keep in view wherever the site
// crops it to fill a frame. content/focus.json maps a photo's path to a CSS position, e.g.
// { "/uploads/walk-x1y2z.jpg": "30% 20%" }. Use as :style="photoFocus(src)" on an object-fit: cover
// img; a photo nobody has set keeps the page's own default (the middle, or the top on story cards).
// The editor's live preview rewrites this same object in place, so drafts show up here too.
const points = focus as Record<string, string>

export function photoFocus(src?: string | null) {
  const point = src ? points[src] : undefined
  return point ? { objectPosition: point } : undefined
}
