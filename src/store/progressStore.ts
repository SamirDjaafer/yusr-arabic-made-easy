import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProgressStateData } from '../types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface ProgressStore extends ProgressStateData {
  completeStory: (storyId: string) => void
  isStoryCompleted: (storyId: string) => boolean
  recordExerciseAttempt: (exerciseId: string, correct: boolean) => void
  clearMistake: (exerciseId: string) => void
  touchStreak: () => void
}

const initialState: ProgressStateData = {
  completedStoryIds: [],
  exerciseAttempts: {},
  mistakeQueue: [],
  streak: { count: 0, lastActiveDate: null },
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeStory: (storyId) => {
        get().touchStreak()
        set((state) =>
          state.completedStoryIds.includes(storyId)
            ? state
            : { completedStoryIds: [...state.completedStoryIds, storyId] },
        )
      },

      isStoryCompleted: (storyId) => get().completedStoryIds.includes(storyId),

      recordExerciseAttempt: (exerciseId, correct) => {
        get().touchStreak()
        set((state) => {
          const prev = state.exerciseAttempts[exerciseId]
          const attempts: ProgressStateData['exerciseAttempts'] = {
            ...state.exerciseAttempts,
            [exerciseId]: { correct, attempts: (prev?.attempts ?? 0) + 1 },
          }
          const inQueue = state.mistakeQueue.includes(exerciseId)
          let mistakeQueue = state.mistakeQueue
          if (!correct && !inQueue) {
            mistakeQueue = [...state.mistakeQueue, exerciseId]
          } else if (correct && inQueue) {
            mistakeQueue = state.mistakeQueue.filter((id) => id !== exerciseId)
          }
          return { exerciseAttempts: attempts, mistakeQueue }
        })
      },

      clearMistake: (exerciseId) => {
        set((state) => ({
          mistakeQueue: state.mistakeQueue.filter((id) => id !== exerciseId),
        }))
      },

      touchStreak: () => {
        const today = todayIso()
        set((state) => {
          const { count, lastActiveDate } = state.streak
          if (lastActiveDate === today) return state
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const nextCount = lastActiveDate === yesterday ? count + 1 : 1
          return { streak: { count: nextCount, lastActiveDate: today } }
        })
      },
    }),
    { name: 'arabic-app-progress' },
  ),
)
