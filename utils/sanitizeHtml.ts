// Serialize rich-text HTML down to EXACTLY the subset the site renders with v-html:
//   <em> <strong> <a href> <br>
//
// Everything else is unwrapped (its text is kept) or dropped. Every attribute
// except `href` on <a> is stripped, `href` is checked for dangerous schemes, and
// `rel="noopener"` is forced on every link. <b>/<i> (which document.execCommand
// can emit) are normalized to <strong>/<em>. Nothing else ever reaches the model.

const TAG_MAP: Record<string, 'em' | 'strong' | 'a' | 'br'> = {
  EM: 'em',
  I: 'em',
  STRONG: 'strong',
  B: 'strong',
  A: 'a',
  BR: 'br',
}

function safeHref(raw: string): string {
  const href = (raw || '').trim()
  if (!href) return ''
  const lower = href.toLowerCase().replace(/\s/g, '')
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return ''
  }
  return href
}

function cleanInto(source: Node, target: Node, doc: Document) {
  source.childNodes.forEach((child) => {
    // Text
    if (child.nodeType === 3) {
      target.appendChild(doc.createTextNode(child.textContent || ''))
      return
    }
    // Anything that isn't an element (comments, etc.) is dropped.
    if (child.nodeType !== 1) return

    const el = child as Element
    const mapped = TAG_MAP[el.tagName]

    if (mapped === 'br') {
      target.appendChild(doc.createElement('br'))
      return
    }

    if (mapped) {
      const created = doc.createElement(mapped)
      if (mapped === 'a') {
        const href = safeHref(el.getAttribute('href') || '')
        if (href) created.setAttribute('href', href)
        created.setAttribute('rel', 'noopener')
      }
      cleanInto(el, created, doc)
      // A link with no valid href is pointless — unwrap it, keeping the text.
      if (mapped === 'a' && !created.getAttribute('href')) {
        while (created.firstChild) target.appendChild(created.firstChild)
      } else {
        target.appendChild(created)
      }
      return
    }

    // Disallowed element: unwrap it, keeping its (cleaned) children.
    cleanInto(el, target, doc)
  })
}

export function sanitizeHtml(html: string): string {
  const input = html || ''

  // Non-DOM fallback (SSR / tests). Conservative: only ever emits the allowed
  // tags; strips attributes other than a checked href. The admin is client-only,
  // so the DOM path below is what runs in practice.
  if (typeof document === 'undefined') {
    return input
      .replace(/<\/?(?!(?:em|strong|a|br)\b)[a-z][a-z0-9]*\b[^>]*>/gi, '')
      .replace(/<(em|strong|br)\b[^>]*>/gi, '<$1>')
      .replace(
        /<a\b[^>]*?\bhref\s*=\s*(['"])(.*?)\1[^>]*>/gi,
        (_m, _q, href) => {
          const h = safeHref(href)
          return h ? `<a href="${h}" rel="noopener">` : ''
        },
      )
      .replace(/<a\b[^>]*>/gi, '')
  }

  const container = document.createElement('div')
  const src = document.createElement('div')
  src.innerHTML = input
  cleanInto(src, container, document)
  return container.innerHTML
}
