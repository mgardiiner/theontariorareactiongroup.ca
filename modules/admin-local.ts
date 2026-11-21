import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { addDevServerHandler, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { createError, defineEventHandler, getQuery, readBody } from 'h3'

// `npm run dev` only: lets the website editor (/admin) read and save the files in this
// checkout instead of the GitHub repo, so changes can be tried locally without publishing
// anything. The sign-in screen shows "Edit the files on this computer" in dev.
// Nothing here ships with the site.

const IMAGE = /\.(?:jpe?g|png|webp|gif|svg)$/i

// Only content files and uploaded photos, with no way out of those folders.
const readable = (path: string) => /^content\/[a-z0-9-]+\.json$/.test(path)
const writable = (path: string) =>
  readable(path) || /^public\/uploads\/[\w.-]+\.(?:jpe?g|png|webp|gif|svg)$/i.test(path)

/** The same id GitHub gives a file's contents, so conflict checks work the same way locally. */
function blobSha(buf: Buffer): string {
  return createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex')
}

export default defineNuxtModule({
  meta: { name: 'admin-local' },
  setup(_, nuxt) {
    if (!nuxt.options.dev) return
    const root = nuxt.options.rootDir
    const publicDir = join(root, 'public')

    // Publishing rewrites content/*.json, which the site's pages import, so Vite would reload every
    // open tab, the editor included, cutting off its post-publish bookkeeping. Skip the hot update
    // when the file now holds exactly what the editor just wrote (the editor refreshes its own
    // preview); any other edit to the file still reloads as usual. Vite has already invalidated the
    // module by this point, so the next request gets the new contents either way.
    const justWritten = new Map<string, string>()
    addVitePlugin(
      {
        name: 'admin-local:own-writes',
        async handleHotUpdate({ file, read }) {
          const wrote = justWritten.get(file)
          if (wrote === undefined) return
          justWritten.delete(file)
          if ((await read()) === wrote) return []
        },
      },
      { server: false },
    )

    async function listImages(dir: string): Promise<{ path: string; at: number }[]> {
      let entries
      try {
        entries = await readdir(dir, { withFileTypes: true })
      } catch {
        return []
      }
      const nested = await Promise.all(
        entries.map(async (entry) => {
          const full = join(dir, entry.name)
          if (entry.isDirectory()) return listImages(full)
          if (!IMAGE.test(entry.name)) return []
          return [{ path: `/${relative(publicDir, full)}`, at: (await stat(full)).mtimeMs }]
        }),
      )
      return nested.flat()
    }

    // One save at a time. The conflict check and the writes are separate async steps, so two saves
    // at once (two tabs) could both pass the check and the second overwrite the first; queued, the
    // second checks against what the first wrote and is refused like on GitHub.
    let saving: Promise<unknown> = Promise.resolve()
    const oneAtATime = <T>(job: () => Promise<T>): Promise<T> => {
      const run = saving.then(job)
      saving = run.catch(() => undefined) // the queue only waits for it; the caller still gets the error
      return run
    }

    addDevServerHandler({
      route: '/__admin-local',
      handler: defineEventHandler(async (event) => {
        if (event.method === 'GET') {
          const q = getQuery(event)
          if (q.images) {
            const found = [
              ...(await listImages(join(publicDir, 'uploads'))),
              ...(await listImages(join(publicDir, 'images'))),
            ]
            return { images: found.sort((a, b) => b.at - a.at).map((f) => f.path) }
          }
          const path = String(q.file || '')
          if (!readable(path)) throw createError({ statusCode: 400, statusMessage: `Not readable: ${path}` })
          try {
            const buf = await readFile(join(root, path))
            return { text: buf.toString('utf8'), sha: blobSha(buf) }
          } catch {
            throw createError({ statusCode: 404, statusMessage: `Not found: ${path}` })
          }
        }
        if (event.method === 'POST') {
          const { files, expect = {} } = await readBody<{
            files: { path: string; text?: string; base64?: string }[]
            expect?: Record<string, string | null> // path -> the sha the edit started from (null: didn't exist)
          }>(event)
          const refused = (files || []).filter((f) => !writable(f.path) || f.path.includes('..'))
          if (refused.length) {
            throw createError({ statusCode: 400, statusMessage: `Not writable: ${refused.map((f) => f.path).join(', ')}` })
          }
          return oneAtATime(async () => {
            // Like GitHub, refuse to write over a file that changed since the editor loaded it.
            for (const [path, sha] of Object.entries(expect)) {
              if (!readable(path)) throw createError({ statusCode: 400, statusMessage: `Not readable: ${path}` })
              const now = await readFile(join(root, path)).then(blobSha, () => null)
              if (now !== sha) throw createError({ statusCode: 409, statusMessage: `Changed since it was loaded: ${path}` })
            }
            const shas: Record<string, string> = {}
            for (const f of files) {
              const target = join(root, f.path)
              const buf = f.base64 !== undefined ? Buffer.from(f.base64, 'base64') : Buffer.from(f.text ?? '', 'utf8')
              await mkdir(dirname(target), { recursive: true })
              if (f.base64 === undefined) justWritten.set(target, f.text ?? '')
              await writeFile(target, buf)
              shas[f.path] = blobSha(buf)
            }
            return { ok: true, commit: `local-${Date.now().toString(36)}`, shas }
          })
        }
        throw createError({ statusCode: 405 })
      }),
    })
  },
})
