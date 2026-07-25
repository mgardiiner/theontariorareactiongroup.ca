// Browser-only GitHub REST API helpers for the admin panel.
// No backend: each editor's own fine-grained token is passed in and used directly.

export const GH_REPO = {
  owner: 'mgardiiner',
  repo: 'theontariorareactiongroup.ca',
  branch: 'main',
}

const API = 'https://api.github.com'

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

/** Most recent commit on the branch — used to show "last published" in the dashboard. */
export async function latestCommit(
  token: string,
): Promise<{ message: string; date: string; url: string } | null> {
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
