import { FOCUS_FILE } from '~/admin/schema'

// "Choose what shows" in the website editor: the part of a photo to keep in view where the site crops
// it. The points live in content/focus.json ({ "/uploads/x.jpg": "30% 20%" }), an ordinary content
// file, so a choice is a pending change with its own Undo, goes out with Publish, merges like any
// other edit, and reaches the live preview through the drafts. utils/photoFocus.ts applies them on
// the site.

type FocusMap = Record<string, string>

const editing = ref('') // the photo the dialog is open for; '' when closed
const ready = ref(false)
let loading: Promise<void> | null = null

// Same points, whatever order the keys were added in.
const samePoints = (a: FocusMap | null, b: FocusMap | null) =>
  JSON.stringify(Object.entries(a ?? {}).sort()) === JSON.stringify(Object.entries(b ?? {}).sort())
const fileName = (src: string) => src.split('/').pop() || src

export function usePhotoFocus() {
  const { getData, draftFiles, publishedData, stageChange, discardFile } = useDrafts()
  const preview = useAdminPreview()

  /** Load focus.json into the drafts store. Choosing waits for it, so a change always has a base. */
  function ensureLoaded(): Promise<void> {
    if (!import.meta.client) return Promise.resolve()
    loading ??= getData(FOCUS_FILE).then(
      () => {
        ready.value = true
      },
      (e) => {
        loading = null // try again next time a photo field opens
        console.warn('[admin] photo focus unavailable:', e)
      },
    )
    return loading
  }

  /** Every photo's point as the editor has it now: this device's draft, else the published file. */
  const points = computed<FocusMap>(() => draftFiles.value[FOCUS_FILE] ?? publishedData(FOCUS_FILE) ?? {})

  const pointOf = (src?: string | null) => (src ? points.value[src] || '' : '')

  /** The object-position for a photo in the editor, falling back to the crop the site would use. */
  const styleFor = (src?: string | null, fallback = '50% 50%') => ({ objectPosition: pointOf(src) || fallback })

  function open(src?: string | null) {
    if (src && ready.value) editing.value = src
  }

  /** Show a point in the live preview while it's being chosen (null: the site's usual crop). */
  function show(src: string, point: string | null) {
    const next = { ...points.value }
    if (point) next[src] = point
    else delete next[src]
    preview.overrides.value = { ...preview.overrides.value, [FOCUS_FILE]: next }
  }

  function close() {
    editing.value = ''
    if (!(FOCUS_FILE in preview.overrides.value)) return
    const { [FOCUS_FILE]: _, ...rest } = preview.overrides.value
    preview.overrides.value = rest
  }

  /** Keep a choice for a photo (null: back to the site's usual crop) as a pending change. */
  function save(src: string, point: string | null) {
    const next = { ...points.value }
    if (point) next[src] = point
    else delete next[src]
    if (samePoints(next, points.value)) return
    // Back to what the live site has: there's nothing left to publish, so drop the changes.
    if (samePoints(next, publishedData(FOCUS_FILE))) return discardFile(FOCUS_FILE)
    stageChange(FOCUS_FILE, next, point ? `Chose what shows in ${fileName(src)}` : `Reset what shows in ${fileName(src)}`)
  }

  return { ready, editing, ensureLoaded, points, pointOf, styleFor, open, show, close, save }
}
