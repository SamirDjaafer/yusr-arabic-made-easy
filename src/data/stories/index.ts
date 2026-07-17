import type { Exercise, Story } from '../../types'
import { story01 } from './story-01-azar-and-the-idols'
import { story02 } from './story-02-ibrahim-sees-shirk'
import { story03 } from './story-03-tawhid'
import { story04 } from './story-04-the-eid'
import { story05 } from './story-05-the-disputation'
import { story06 } from './story-06-the-fire'
import { originalStoriesFrom } from '../original/adapter'

// Lessons 1-6 are our hand-enriched versions (with inline exercises and
// grammar tips); lessons 7+ come straight from the original database.
export const stories: Story[] = [story01, story02, story03, story04, story05, story06, ...originalStoriesFrom(7)].sort(
  (a, b) => a.order - b.order,
)

export function getStoryById(id: string): Story | undefined {
  return stories.find((s) => s.id === id)
}

// Everything is always unlocked — the path still shows completion state, but
// nothing gates access to any story, deck, or exercise.
export function isStoryUnlocked(_story: Story, _completedStoryIds: string[]): boolean {
  return true
}

export function findExerciseById(exerciseId: string): Exercise | undefined {
  for (const story of stories) {
    for (const segment of story.segments) {
      if (segment.kind === 'exercise' && segment.exercise.id === exerciseId) return segment.exercise
    }
    const fromQuiz = story.endQuiz.find((ex) => ex.id === exerciseId)
    if (fromQuiz) return fromQuiz
  }
  return undefined
}
