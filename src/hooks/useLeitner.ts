import { useMemo } from 'react'
import { useFlashcardStore } from '../store/flashcardStore'
import { words } from '../data/words'

export type { LeitnerRating } from '../lib/leitner'

/** Words due today (or never studied), for suggesting a 5-word session. */
export function useDueWords(limit = 5) {
  const cards = useFlashcardStore((s) => s.cards)
  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const due = words.filter((w) => {
      const card = cards[w.id]
      return !card || card.nextReviewDate <= today
    })
    return due.slice(0, limit)
  }, [cards, limit])
}
