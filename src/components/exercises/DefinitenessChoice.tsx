import { useState } from 'react'
import type { DefinitenessChoiceExercise } from '../../types'

export function DefinitenessChoice({
  exercise,
  onSubmit,
}: {
  exercise: DefinitenessChoiceExercise
  onSubmit: (correct: boolean, correctAnswerLabel: string) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  const choose = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    onSubmit(index === exercise.correctIndex, exercise.options[exercise.correctIndex])
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink-800 dark:text-parchment-100">{exercise.englishPrompt}</p>
      <div className="flex flex-wrap gap-2">
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
              dir="rtl"
              className={`font-arabic rounded-xl border px-5 py-3 text-2xl transition-colors ${
                revealed && isCorrect
                  ? 'border-leaf-500 bg-leaf-100 dark:bg-leaf-500/15'
                  : revealed && isSelected
                    ? 'border-rose-500 bg-rose-100 dark:bg-rose-500/15'
                    : 'border-teal-700/15 bg-white/60 hover:border-teal-500/40 dark:border-teal-300/15 dark:bg-ink-900/40'
              } ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
