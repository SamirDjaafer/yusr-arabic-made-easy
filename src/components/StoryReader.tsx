import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Exercise, Story, StorySegment } from '../types'
import { ArabicText } from './ArabicText'
import { WordChip } from './WordChip'
import { GrammarCallout } from './GrammarCallout'
import { ExerciseRenderer } from './ExerciseRenderer'
import { useProgressStore } from '../store/progressStore'

type Step = { kind: 'segment'; segment: StorySegment } | { kind: 'quiz'; exercise: Exercise; index: number; total: number } | { kind: 'complete' }

export function StoryReader({ story }: { story: Story }) {
  const steps = useMemo<Step[]>(() => {
    const segmentSteps: Step[] = story.segments.map((segment) => ({ kind: 'segment', segment }))
    const quizSteps: Step[] = story.endQuiz.map((exercise, i) => ({
      kind: 'quiz',
      exercise,
      index: i + 1,
      total: story.endQuiz.length,
    }))
    return [...segmentSteps, ...quizSteps, { kind: 'complete' }]
  }, [story])

  const [stepIndex, setStepIndex] = useState(0)
  const completeStory = useProgressStore((s) => s.completeStory)
  const step = steps[stepIndex]

  useEffect(() => {
    if (step.kind === 'complete') completeStory(story.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.kind, story.id])

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))

  return (
    <div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-teal-700/10 dark:bg-teal-300/10">
        <motion.div
          className="h-full rounded-full bg-teal-600 dark:bg-teal-400"
          animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {step.kind === 'segment' && step.segment.kind === 'narration' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-teal-700/10 bg-white/60 p-6 dark:border-teal-100/10 dark:bg-ink-900/40">
                <ArabicText
                  arabic={step.segment.arabic}
                  transliteration={step.segment.transliteration}
                  english={step.segment.english}
                  size="lg"
                  concealTranslations
                />
              </div>
              {step.segment.wordIds && step.segment.wordIds.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  {step.segment.wordIds.map((wid) => (
                    <WordChip key={wid} wordId={wid} />
                  ))}
                </div>
              )}
              <ContinueButton onClick={goNext} />
            </div>
          )}

          {step.kind === 'segment' && step.segment.kind === 'grammar-tip' && (
            <div className="space-y-4">
              <GrammarCallout grammarId={step.segment.grammarId} compact />
              <ContinueButton onClick={goNext} />
            </div>
          )}

          {step.kind === 'segment' && step.segment.kind === 'exercise' && (
            <ExerciseRenderer exercise={step.segment.exercise} onContinue={goNext} />
          )}

          {step.kind === 'quiz' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600 dark:text-gold-300">
                Story quiz — question {step.index} of {step.total}
              </p>
              <ExerciseRenderer exercise={step.exercise} onContinue={goNext} />
            </div>
          )}

          {step.kind === 'complete' && (
            <div className="rounded-2xl border border-gold-400/40 bg-gold-200/30 p-8 text-center dark:border-gold-500/30 dark:bg-gold-700/10">
              <p className="text-4xl">🎉</p>
              <h2 className="mt-2 text-2xl font-bold text-ink-900 dark:text-parchment-50">Story complete!</h2>
              <p className="mt-1 text-ink-700 dark:text-parchment-200/90">
                You finished "{story.title}". New words and grammar are saved to your progress.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  to="/stories"
                  className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
                >
                  Back to stories
                </Link>
                <Link
                  to="/flashcards"
                  className="rounded-full border border-teal-700/30 px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-700/10 dark:border-teal-300/30 dark:text-teal-300"
                >
                  Practice new words
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
    >
      Continue →
    </button>
  )
}
