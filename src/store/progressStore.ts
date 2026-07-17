import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProgressStateData } from '../types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export type SelfGrade = 'no-idea' | 'nearly' | 'got-it'

/** correct answers needed in a drill type before it shows as mastered for the current lesson */
export const MASTERY_TARGET = 10

/** actions (cards graded / questions answered) needed in a day for the streak to count — same rule as the original platform */
export const STREAK_DAILY_TARGET = 20

interface ProgressStore extends ProgressStateData {
  /** the lesson/story the student says they are on — scopes vocab, grammar, exercises, challenges */
  currentStoryId: string
  /** per story, per drill type: how many questions answered correctly (drives "N until mastery") */
  drillMastery: Record<string, Record<string, number>>
  /** per story, per challenge id: saved answers + submitted flag */
  challenges: Record<string, Record<string, { answers: string[]; submitted: boolean }>>
  /** stories whose grammar the student has marked as done (lights the Grammar torch on the journey) */
  grammarDone: Record<string, true>
  /** actions performed per day (date key -> count) — 20 in a day locks in the streak */
  dailyActions: Record<string, number>

  markGrammarDone: (storyId: string) => void
  /** count an action toward today's streak; weight lets big events (finishing a story) qualify a day at once */
  recordAction: (weight?: number) => void

  setCurrentStory: (storyId: string) => void
  completeStory: (storyId: string) => void
  isStoryCompleted: (storyId: string) => boolean
  recordExerciseAttempt: (exerciseId: string, correct: boolean) => void
  recordDrillResult: (storyId: string, drillType: string, correct: boolean) => void
  saveChallenge: (storyId: string, challengeId: string, answers: string[], submitted: boolean) => void
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
      currentStoryId: 'story-01',
      drillMastery: {},
      challenges: {},
      grammarDone: {},
      dailyActions: {},

      markGrammarDone: (storyId) => {
        get().recordAction(5)
        set((state) => ({ grammarDone: { ...state.grammarDone, [storyId]: true } }))
      },

      recordAction: (weight = 1) => {
        const today = todayIso()
        set((state) => ({ dailyActions: { ...state.dailyActions, [today]: (state.dailyActions[today] ?? 0) + weight } }))
        if ((get().dailyActions[today] ?? 0) >= STREAK_DAILY_TARGET) get().touchStreak()
      },

      setCurrentStory: (storyId) => set({ currentStoryId: storyId }),

      completeStory: (storyId) => {
        get().recordAction(STREAK_DAILY_TARGET)
        set((state) =>
          state.completedStoryIds.includes(storyId)
            ? state
            : { completedStoryIds: [...state.completedStoryIds, storyId] },
        )
      },

      isStoryCompleted: (storyId) => get().completedStoryIds.includes(storyId),

      recordExerciseAttempt: (exerciseId, correct) => {
        get().recordAction()
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

      recordDrillResult: (storyId, drillType, correct) => {
        get().recordAction()
        if (!correct) return
        set((state) => {
          const forStory = state.drillMastery[storyId] ?? {}
          return {
            drillMastery: {
              ...state.drillMastery,
              [storyId]: { ...forStory, [drillType]: (forStory[drillType] ?? 0) + 1 },
            },
          }
        })
      },

      saveChallenge: (storyId, challengeId, answers, submitted) => {
        get().recordAction(submitted ? 5 : 1)
        set((state) => {
          const forStory = state.challenges[storyId] ?? {}
          return {
            challenges: { ...state.challenges, [storyId]: { ...forStory, [challengeId]: { answers, submitted } } },
          }
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
