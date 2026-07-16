import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlashcardStateData, LeitnerCard } from '../types'
import { addDaysIso, intervalDaysForBox, nextBoxForRating, type LeitnerRating } from '../lib/leitner'

interface FlashcardStore extends FlashcardStateData {
  rate: (wordId: string, rating: LeitnerRating) => void
  getCard: (wordId: string) => LeitnerCard | undefined
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      cards: {},

      rate: (wordId, rating) => {
        set((state) => {
          const current = state.cards[wordId]
          const nextBox = nextBoxForRating(current?.box ?? 0, rating)
          const nextCard: LeitnerCard = {
            box: nextBox,
            nextReviewDate: addDaysIso(intervalDaysForBox(nextBox)),
            lastResult: rating,
          }
          return { cards: { ...state.cards, [wordId]: nextCard } }
        })
      },

      getCard: (wordId) => get().cards[wordId],
    }),
    { name: 'arabic-app-flashcards' },
  ),
)
