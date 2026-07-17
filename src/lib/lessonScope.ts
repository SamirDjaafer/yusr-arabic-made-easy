import type { Story, Word } from '../types'
import { stories, getStoryById } from '../data/stories'
import { words } from '../data/words'

// The student picks the story/lesson they are on, and every section shows the
// cumulative subset for stories 1..N: vocab, grammar concepts, sentences,
// exercises and challenges. Function words (particles, prepositions, pronouns,
// demonstratives, relative pronouns) are foundation vocabulary that every
// story leans on, so they are always in scope.

const ALWAYS_IN_SCOPE_POS = new Set(['particle', 'preposition', 'pronoun', 'demonstrative', 'relative-pronoun'])

export function storiesUpTo(currentStoryId: string): Story[] {
  const current = getStoryById(currentStoryId)
  if (!current) return stories
  return stories.filter((s) => s.order <= current.order)
}

/** word ids explicitly introduced by stories 1..current */
export function scopedWordIds(currentStoryId: string): Set<string> {
  const ids = new Set<string>()
  for (const story of storiesUpTo(currentStoryId)) {
    for (const id of story.newWordIds) ids.add(id)
  }
  return ids
}

/** roots of every scoped word — used to admit conjugation twins (يَعْبُدُ when عَبَدَ is known) */
export function scopedRoots(currentStoryId: string): Set<string> {
  const roots = new Set<string>()
  const ids = scopedWordIds(currentStoryId)
  for (const w of words) {
    if (ids.has(w.id) && w.root) roots.add(w.root)
  }
  return roots
}

export function isWordInScope(word: Word, currentStoryId: string): boolean {
  if (ALWAYS_IN_SCOPE_POS.has(word.partOfSpeech)) return true
  const ids = scopedWordIds(currentStoryId)
  if (ids.has(word.id)) return true
  // conjugation twins share the root of a word already met
  if (word.root && scopedRoots(currentStoryId).has(word.root)) return true
  return false
}

export function scopedWords(currentStoryId: string): Word[] {
  return words.filter((w) => isWordInScope(w, currentStoryId))
}

/** grammar concept ids taught by stories 1..current */
export function scopedConceptIds(currentStoryId: string): Set<string> {
  const ids = new Set<string>()
  for (const story of storiesUpTo(currentStoryId)) {
    for (const id of story.grammarConceptIds) ids.add(id)
  }
  return ids
}
