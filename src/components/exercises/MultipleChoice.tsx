import { useState } from 'react'
import type { MultipleChoiceExercise } from '../../types'

export function MultipleChoice({
  exercise,
  onSubmit,
}: {
  exercise: MultipleChoiceExercise
  onSubmit: (correct: boolean, correctAnswerLabel: string) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  const choose = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    onSubmit(index === exercise.correctIndex, exercise.options[exercise.correctIndex])
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {exercise.options.map((option, i) => {
        const isCorrect = i === exercise.correctIndex
        const isSelected = i === selected
        const revealed = selected !== null
        return (
          <button
            key={option}
            type="button"
            onClick={() => choose(i)}
            disabled={revealed}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              revealed && isCorrect
                ? 'border-leaf-500 bg-leaf-100 text-ink-900 dark:bg-leaf-500/15 dark:text-parchment-50'
                : revealed && isSelected
                  ? 'border-rose-500 bg-rose-100 text-ink-900 dark:bg-rose-500/15 dark:text-parchment-50'
                  : 'border-teal-700/15 bg-white/60 hover:border-teal-500/40 dark:border-teal-300/15 dark:bg-ink-900/40'
            } ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
