import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FlashcardStateData, LeitnerCard } from '../types'
import { profileStorage } from '../lib/profile'
import { addDaysIso, intervalDaysForBox, nextBoxForRating, type LeitnerRating } from '../lib/leitner'

/** the three self-grades used on card backs, matching the reference platform */
export type CardGrade = 'no-idea' | 'nearly' | 'got-it'

const GRADE_TO_LEITNER: Record<CardGrade, LeitnerRating> = {
  'no-idea': 'again',
  nearly: 'hard',
  'got-it': 'good',
}

interface FlashcardStore extends FlashcardStateData {
  /** card ids the student has graded "Got it right!" at least once — drives deck mastery % */
  mastered: Record<string, true>
  rate: (wordId: string, rating: LeitnerRating) => void
  gradeCard: (wordId: string, grade: CardGrade) => void
  getCard: (wordId: string) => LeitnerCard | undefined
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      cards: {},
      mastered: {},

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

      gradeCard: (wordId, grade) => {
        get().rate(wordId, GRADE_TO_LEITNER[grade])
        if (grade === 'got-it') {
          set((state) => ({ mastered: { ...state.mastered, [wordId]: true } }))
        }
      },

      getCard: (wordId) => get().cards[wordId],
    }),
    { name: 'arabic-app-flashcards', storage: createJSONStorage(() => profileStorage) },
  ),
)
