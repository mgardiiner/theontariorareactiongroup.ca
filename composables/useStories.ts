import content from '~/content/stories.json'

export const stories = content.stories

export function useStories() {
  return { stories }
}

export function useStory(slug: string) {
  return stories.find(s => s.slug === slug) ?? null
}
