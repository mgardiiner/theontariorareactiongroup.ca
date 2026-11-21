// Browser-only GitHub REST API helpers for the admin panel.
// No backend: each editor's own fine-grained token is passed in and used directly.

export const GH_REPO = {
  owner: 'mgardiiner',
  repo: 'theontariorareactiongroup.ca',
  // Live: the admin reads and publishes content to the default branch, which
  // rebuilds and deploys the site on push.
  branch: 'main',
}

const API = 'https://api.github.com'

// ---- Local files (npm run dev only) ----
// Signing in with this key makes every helper below read and write the files in this checkout
// through modules/admin-local.ts instead of GitHub, so nothing is published. In a production
// build `import.meta.dev` is false, so the key is just an invalid token there.
export const LOCAL_KEY = 'local-files'
export const isLocal = (token: string | null | undefined) => import.meta.dev && token === LOCAL_KEY

async function localFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/__admin-local${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.statusMessage || ''
    } catch {
      /* ignore */
    }
    const err = new Error(`Local files ${res.status}${detail ? `: ${detail}` : ''}`) as GhError
    err.status = res.status
    throw err
  }
  return res.json()
}

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// ---- UTF-8-safe base64 (content has smart quotes, é, ×, etc.) ----
export function stringToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

export function base64ToString(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export interface GhError extends Error {
  status?: number
}

async function ghFetch(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    // GitHub sends max-age=60, so the browser would otherwise answer from its cache: a file, sha
    // or build status up to a minute old right after a publish. no-cache revalidates by ETag
    // (an unchanged answer is a free 304).
    cache: 'no-cache',
    ...init,
    headers: { ...ghHeaders(token), ...(init?.headers || {}) },
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.message || ''
    } catch {
      /* ignore */
    }
    const err = new Error(
      `GitHub API ${res.status}${detail ? `: ${detail}` : ''}`,
    ) as GhError
    err.status = res.status
    throw err
  }
  return res
}

/** Validate a token against this repo and confirm it can write. Returns the repo's permission flags. */
export async function validateToken(
  token: string,
): Promise<{ push: boolean; login?: string }> {
  if (isLocal(token)) return { push: true }
  const res = await ghFetch(
    token,
    `/repos/${GH_REPO.owner}/${GH_REPO.repo}`,
  )
  const data = await res.json()
  return { push: Boolean(data?.permissions?.push) }
}

export interface LoadedFile<T = unknown> {
  data: T
  sha: string
}

/** Read + parse a JSON file from the repo. Returns parsed data and the blob sha (needed to update). */
export async function loadJsonFile<T = unknown>(
  token: string,
  path: string,
): Promise<LoadedFile<T>> {
  if (isLocal(token)) {
    const { text, sha } = await localFetch(`?file=${encodeURIComponent(path)}`)
    return { data: JSON.parse(text) as T, sha }
  }
  const res = await ghFetch(
    token,
    `/repos/${GH_REPO.owner}/${GH_REPO.repo}/contents/${path}?ref=${GH_REPO.branch}`,
  )
  const json = await res.json()
  const text = base64ToString(json.content)
  return { data: JSON.parse(text) as T, sha: json.sha }
}

/** Commit an updated JSON file. Pass the sha from loadJsonFile. Returns the new sha. */
export async function saveJsonFile(
  token: string,
  path: string,
  data: unknown,
  sha: string,
  message: string,
  branch: string = GH_REPO.branch,
): Promise<string> {
  const body = {
    message,
    content: stringToBase64(JSON.stringify(data, null, 2) + '\n'),
    sha,
    branch,
  }
  const res = await ghFetch(
    token,
    `/repos/${GH_REPO.owner}/${GH_REPO.repo}/contents/${path}`,
    { method: 'PUT', body: JSON.stringify(body) },
  )
  const json = await res.json()
  return json.content?.sha as string
}

/** Commit a binary asset (e.g. an uploaded image) already encoded as base64. */
export async function saveBinaryFile(
  token: string,
  path: string,
  base64Content: string,
  message: string,
  sha?: string,
  branch: string = GH_REPO.branch,
): Promise<string> {
  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch,
  }
  if (sha) body.sha = sha
  const res = await ghFetch(
    token,
    `/repos/${GH_REPO.owner}/${GH_REPO.repo}/contents/${path}`,
    { method: 'PUT', body: JSON.stringify(body) },
  )
  const json = await res.json()
  return json.content?.sha as string
}

/** Current blob sha of a file (null if it doesn't exist). Used for pre-publish conflict detection. */
export async function getFileSha(
  token: string,
  path: string,
  branch: string = GH_REPO.branch,
): Promise<string | null> {
  if (isLocal(token)) {
    try {
      return (await localFetch(`?file=${encodeURIComponent(path)}`)).sha as string
    } catch (e) {
      if ((e as GhError).status === 404) return null
      throw e
    }
  }
  try {
    const res = await ghFetch(
      token,
      `/repos/${GH_REPO.owner}/${GH_REPO.repo}/contents/${path}?ref=${branch}`,
    )
    return (await res.json()).sha as string
  } catch (e) {
    if ((e as GhError).status === 404) return null
    throw e
  }
}

/** A file to commit: text (JSON content) or binary already encoded as base64 (a photo). */
export type CommitFile = { path: string; content: string } | { path: string; base64: string }

/** "Someone else published first": the editor merges their version in and tries again. */
export function conflictError(file: string) {
  const err = new Error('Someone else changed the website while you were working.') as GhError & {
    code: string
    file: string
  }
  err.code = 'conflict'
  err.file = file
  return err
}

/**
 * Commit several files in ONE commit via the Git Data API (blobs -> tree -> commit -> move ref),
 * so the site rebuilds once no matter how many files changed. Returns the new commit sha and each
 * file's new blob sha (the base for the next conflict check).
 *
 * `expect` maps paths to the blob sha the edit started from (null: the file didn't exist yet). If
 * any differs in the commit this one builds on, nothing is written and it throws conflictError.
 * Moving the branch only fast-forwards, so someone publishing after that check is refused the same way.
 */
export async function commitFiles(
  token: string,
  files: CommitFile[],
  message: string,
  branch: string = GH_REPO.branch,
  onProgress?: (done: number, total: number) => void,
  expect: Record<string, string | null> = {},
): Promise<{ commit: string; shas: Record<string, string> }> {
  if (isLocal(token)) {
    const body = files.map((f) => ('base64' in f ? { path: f.path, base64: f.base64 } : { path: f.path, text: f.content }))
    try {
      const res = await localFetch('', { method: 'POST', body: JSON.stringify({ files: body, expect }) })
      return { commit: res.commit as string, shas: res.shas as Record<string, string> }
    } catch (e) {
      if ((e as GhError).status === 409) throw conflictError(Object.keys(expect)[0] ?? '')
      throw e
    }
  }
  const git = `/repos/${GH_REPO.owner}/${GH_REPO.repo}/git`

  const refJson = await (await ghFetch(token, `${git}/ref/heads/${branch}`)).json()
  const latestCommitSha = refJson.object.sha
  for (const [path, sha] of Object.entries(expect)) {
    if ((await getFileSha(token, path, latestCommitSha)) !== sha) throw conflictError(path)
  }
  const baseCommit = await (await ghFetch(token, `${git}/commits/${latestCommitSha}`)).json()
  const baseTreeSha = baseCommit.tree.sha

  const tree: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = []
  const shas: Record<string, string> = {}
  for (const [i, f] of files.entries()) {
    onProgress?.(i, files.length)
    const content = 'base64' in f ? f.base64 : stringToBase64(f.content)
    const blob = await (
      await ghFetch(token, `${git}/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content, encoding: 'base64' }),
      })
    ).json()
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
    shas[f.path] = blob.sha
  }
  onProgress?.(files.length, files.length)

  const newTree = await (
    await ghFetch(token, `${git}/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    })
  ).json()

  const newCommit = await (
    await ghFetch(token, `${git}/commits`, {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [latestCommitSha] }),
    })
  ).json()

  try {
    await ghFetch(token, `${git}/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha }),
    })
  } catch (e) {
    // "Update is not a fast forward": someone published between the check above and now.
    if ((e as GhError).status === 422 && /fast.forward/i.test((e as Error).message)) {
      throw conflictError(Object.keys(expect)[0] ?? files[0]?.path ?? '')
    }
    throw e
  }
  return { commit: newCommit.sha as string, shas }
}

/** Most recent commit on the branch — used to show "last published" in the dashboard. */
export async function latestCommit(
  token: string,
): Promise<{ message: string; date: string; url: string } | null> {
  if (isLocal(token)) return null
  try {
    const res = await ghFetch(
      token,
      `/repos/${GH_REPO.owner}/${GH_REPO.repo}/commits/${GH_REPO.branch}`,
    )
    const json = await res.json()
    return {
      message: json.commit?.message ?? '',
      date: json.commit?.author?.date ?? '',
      url: json.html_url ?? '',
    }
  } catch {
    return null
  }
}

/** Every photo already in the site (public/uploads and public/images), as site paths like /uploads/x.jpg. */
export async function listImages(token: string): Promise<string[]> {
  if (isLocal(token)) return (await localFetch('?images=1')).images as string[]
  const res = await ghFetch(
    token,
    `/repos/${GH_REPO.owner}/${GH_REPO.repo}/git/trees/${GH_REPO.branch}?recursive=1`,
  )
  const json = await res.json()
  return (json.tree as { path: string; type: string }[])
    .filter((e) => e.type === 'blob' && /^public\/(uploads|images)\/.+\.(jpe?g|png|webp|gif|svg)$/i.test(e.path))
    .map((e) => e.path.slice('public'.length))
    .reverse()
}

export type BuildState = 'waiting' | 'building' | 'built' | 'failed' | 'unknown'

/**
 * Where GitHub Actions is with the build for a commit. 'unknown' when the key can't read Actions
 * (it only needs Contents access to publish), so callers fall back to watching the site itself.
 */
export async function buildState(token: string, commit: string): Promise<BuildState> {
  if (isLocal(token)) return 'unknown'
  try {
    const res = await ghFetch(
      token,
      `/repos/${GH_REPO.owner}/${GH_REPO.repo}/actions/runs?head_sha=${commit}&per_page=10`,
    )
    const runs = ((await res.json()).workflow_runs || []) as { status: string; conclusion: string | null }[]
    if (!runs.length) return 'waiting'
    if (runs.some((r) => r.status === 'completed' && r.conclusion && r.conclusion !== 'success' && r.conclusion !== 'skipped')) return 'failed'
    if (runs.every((r) => r.status === 'completed')) return 'built'
    return 'building'
  } catch {
    return 'unknown'
  }
}

/**
 * The commit the live site was built from, read from /version.json (written at build time by
 * server/routes/version.json.ts). Same origin, cache-busted, so it reflects what visitors get.
 */
export async function liveVersion(): Promise<{ sha: string; builtAt: string } | null> {
  // On localhost the dev server isn't the live site; ask the real one (GitHub Pages allows it).
  const base = import.meta.dev ? 'https://ontariorare.ca' : ''
  try {
    const res = await fetch(`${base}/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
