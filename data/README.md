# `data/` — harvested source material

Research data scraped from the organization's own public channels, kept separate
from `content/`. **Nothing here is read by the site at build time** — these are
source files to draw real content *from*, so that `content/*.json` stops carrying
invented placeholder text.

Scraped **2026-07-24** from `instagram.com/ontariorare`.

| File | What's in it |
|---|---|
| `instagram-profile.json` | Bio, handle, external link, follower/post counts, Linktree contents |
| `instagram-posts.json` | 12 posts with **verbatim captions**, dates, likes, hashtags, mentions, permalinks |
| `people.json` | Co-founders, MPP speakers, honoured guests, and the three storytellers |
| `organizations.json` | Evidenced affiliates, sponsors, event supporters, plus their recruitment copy |
| `events.json` | Real past events, the announced 2026–27 roadmap, meeting cadence, campaigns |
| `quotes.json` | Verbatim slogans and mission statements — the org's actual voice |
| `policy-references.json` | Real statistics, **Bill 129**, government sources, stated advocacy priorities |
| `videos.json` | The only two videos that exist on the account |
| `images.json` | Manifest for all 20 downloaded images: description, **alt text**, suggested use |
| `brand.json` | Logo lockup, measured colour palette, visual motifs, card templates |

## Images

20 images (2.1 MB) are in **`public/images/instagram/`**, served by Nuxt at
`/images/instagram/…`. Instagram's CDN URLs expire, so these local copies are the
durable version.

Every `description` and `alt` in `images.json` was written **after viewing the
actual image**, not inferred from the caption — filenames alone are misleading
(one carousel initially looked like event photos and turned out to be a meme
series).

Highlights:

- `2026-05-13-queens-park-group-photo.jpg` — the best asset on the account: ~60–80
  attendees on the Queen's Park staircase. Natural events-page hero.
- Three branded story cards matching the three people in `content/stories.json`.
- `2026-06-15-every-journey-is-unique.jpg` — the **"Connecting Patients to Care"**
  five-stage framework, captured in `events.json` → `advocacyFramework`.

**Rights:** all of these were published by the organization on its own account, so
they are presumably theirs to reuse. But entries flagged `peopleVisible: true`
show identifiable people — Instagram consent is not website consent. Confirm
before publishing, especially the `hallelujah-series` frames, which show a person
the post does not name.

## Conventions

- Every entry carries a `source` — usually an Instagram permalink — so any claim
  can be traced back.
- `verbatim: true` means the text is word-for-word as published. `verbatim: false`
  means it is a summary or a paraphrase, and should not be presented as a quote.
- `_meta` at the top of each file records provenance and any caveat that applies
  to the whole file.
- `warning` / `note` fields flag things that need a human decision.

## Coverage gaps

**Instagram: 12 of 67 posts.** The public `web_profile_info` endpoint returns only
the most recent 12 (2026-05-05 → 2026-07-20). Everything older needs an
authenticated session — GraphQL pagination via both the legacy `query_hash` and
the current `doc_id` returns `Incorrect Query` or a login wall when
unauthenticated, and the `/embed/captioned/` endpoint no longer includes caption
text. The remaining ~55 posts very likely contain more patient stories and the
account's earlier history.

**Instagram Stories highlights: 0 of 7.** Not reachable unauthenticated.

**Facebook group: nothing.** `facebook.com/groups/2609800669415644` returns HTTP
400 unauthenticated; `mbasic` and `m.` variants redirect to a login wall. Only the
group's name — "Ontario Rare Action Group" — could be confirmed. Facebook groups
are not publicly readable without a session, even when the group itself is public.

**News coverage: blocked.** Village Media's syndicated launch story
("New group launches to advocate for rare disease patients in Ontario", on
BarrieToday and BradfordToday) sits behind a Cloudflare challenge. It confirms the
**ORAG** acronym and the mission framing, and reportedly lists a contact email
worth capturing. See `policy-references.json` → `newsCoverage`.

To close these gaps, connect the Claude for Chrome extension and re-run the
scrape against a logged-in session.

## What has already been used

`content/stories.json` was rebuilt from `people.json` → `storytellers`, replacing
six invented personas with Pearl Cooley, Sandra Markus and Kristen Hummel.
`content/challenges.json`'s pull quote was replaced — it had been attributed to a
fabricated clinician at a real hospital.

Still carrying invented content, in rough priority order: `events.json`,
`advocacy.json` (particularly the `progress[]` tracker's bill numbers and claimed
wins), `partners.json`, `videos.json`.
