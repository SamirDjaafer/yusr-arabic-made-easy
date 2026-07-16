import { useState } from 'react'
import type { Exercise } from '../types'
import { useProgressStore } from '../store/progressStore'
import { CorrectionFeedback } from './CorrectionFeedback'
import { MultipleChoice } from './exercises/MultipleChoice'
import { FillBlankEnding } from './exercises/FillBlankEnding'
import { WordOrder } from './exercises/WordOrder'
import { Matching } from './exercises/Matching'
import { DefinitenessChoice } from './exercises/DefinitenessChoice'

interface ExerciseRendererProps {
  exercise: Exercise
  onContinue?: () => void
}

export function ExerciseRenderer({ exercise, onContinue }: ExerciseRendererProps) {
  const [result, setResult] = useState<{ correct: boolean; correctAnswerLabel?: string } | null>(null)
  const recordExerciseAttempt = useProgressStore((s) => s.recordExerciseAttempt)

  const handleSubmit = (correct: boolean, correctAnswerLabel?: string) => {
    setResult({ correct, correctAnswerLabel })
    recordExerciseAttempt(exercise.id, correct)
  }

  return (
    <div className="rounded-2xl border border-teal-700/10 bg-white/50 p-5 shadow-sm dark:border-teal-100/10 dark:bg-ink-900/40">
      <p className="mb-4 text-sm font-semibold text-teal-700 dark:text-teal-300">{exercise.prompt}</p>

      {exercise.type === 'multiple-choice' && <MultipleChoice exercise={exercise} onSubmit={handleSubmit} />}
      {exercise.type === 'fill-blank-ending' && <FillBlankEnding exercise={exercise} onSubmit={handleSubmit} />}
      {exercise.type === 'word-order' && <WordOrder exercise={exercise} onSubmit={handleSubmit} />}
      {exercise.type === 'matching' && <Matching exercise={exercise} onSubmit={handleSubmit} />}
      {exercise.type === 'definiteness-choice' && <DefinitenessChoice exercise={exercise} onSubmit={handleSubmit} />}

      {result && (
        <div className="mt-4 space-y-3">
          <CorrectionFeedback
            correct={result.correct}
            correctAnswerLabel={result.correctAnswerLabel}
            explanation={exercise.explanation}
            relatedGrammarId={exercise.relatedGrammarId}
          />
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
            >
              Continue →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
