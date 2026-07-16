import { useState } from 'react'
import type { FillBlankEndingExercise } from '../../types'

export function FillBlankEnding({
  exercise,
  onSubmit,
}: {
  exercise: FillBlankEndingExercise
  onSubmit: (correct: boolean, correctAnswerLabel: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const choose = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    onSubmit(option === exercise.correctOption, exercise.correctOption)
  }

  const filledSentence = exercise.sentenceTemplate.replace('___', selected ?? '____')

  return (
    <div>
      <p className="font-arabic mb-1 text-right text-2xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
        {filledSentence}
      </p>
      <p className="mb-4 text-right text-sm italic text-teal-700 dark:text-teal-300">{exercise.sentenceTransliteration}</p>
      <div className="flex flex-wrap gap-2">
        {exercise.options.map((option) => {
          const isCorrect = option === exercise.correctOption
          const isSelected = option === selected
          const revealed = selected !== null
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={revealed}
              dir="rtl"
              className={`font-arabic rounded-xl border px-4 py-2 text-xl transition-colors ${
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
