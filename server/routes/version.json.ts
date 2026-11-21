// The commit this copy of the site was built from. Prerendered into a static /version.json at
// build time, so the website editor can tell when a publish has actually gone live (the deploy
// pushes to gh-pages and GitHub Pages serves it a little later, so a finished Actions run alone
// doesn't mean visitors see it yet).
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  return {
    sha: process.env.GITHUB_SHA || 'local',
    builtAt: new Date().toISOString(),
  }
})
