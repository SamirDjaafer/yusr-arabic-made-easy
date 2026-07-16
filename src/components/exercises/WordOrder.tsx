import { useMemo, useState } from 'react'
import type { WordOrderExercise } from '../../types'

interface Tile {
  word: string
  uid: number
}

export function WordOrder({
  exercise,
  onSubmit,
}: {
  exercise: WordOrderExercise
  onSubmit: (correct: boolean, correctAnswerLabel: string) => void
}) {
  const allTiles = useMemo<Tile[]>(() => exercise.tiles.map((word, uid) => ({ word, uid })), [exercise.tiles])
  const [placed, setPlaced] = useState<Tile[]>([])
  const [available, setAvailable] = useState<Tile[]>(allTiles)
  const [result, setResult] = useState<boolean | null>(null)

  const correctLabel = exercise.correctOrder.join(' ')

  const place = (tile: Tile) => {
    if (result !== null) return
    const nextPlaced = [...placed, tile]
    setPlaced(nextPlaced)
    setAvailable(available.filter((t) => t.uid !== tile.uid))

    if (nextPlaced.length === allTiles.length) {
      const correct = nextPlaced.map((t) => t.word).join(' ') === correctLabel
      setResult(correct)
      onSubmit(correct, correctLabel)
    }
  }

  const unplace = (tile: Tile) => {
    if (result !== null) return
    setPlaced(placed.filter((t) => t.uid !== tile.uid))
    setAvailable([...available, tile])
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink-800 dark:text-parchment-100">{exercise.englishGloss}</p>

      <div className="mb-4 flex min-h-14 flex-wrap-reverse justify-end gap-2 rounded-xl border-2 border-dashed border-teal-700/25 p-3 dark:border-teal-300/20" dir="rtl">
        {placed.length === 0 && <span className="text-sm text-ink-500 dark:text-parchment-200/50">Tap words below to build the sentence →</span>}
        {placed.map((tile) => (
          <button
            key={tile.uid}
            type="button"
            onClick={() => unplace(tile)}
            disabled={result !== null}
            className={`font-arabic rounded-lg border px-3 py-1.5 text-xl ${
              result === null
                ? 'border-teal-500/40 bg-teal-700/10 dark:border-teal-300/30 dark:bg-teal-300/10'
                : result
                  ? 'border-leaf-500 bg-leaf-100 dark:bg-leaf-500/15'
                  : 'border-rose-500 bg-rose-100 dark:bg-rose-500/15'
            }`}
          >
            {tile.word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2" dir="rtl">
        {available.map((tile) => (
          <button
            key={tile.uid}
            type="button"
            onClick={() => place(tile)}
            className="font-arabic rounded-lg border border-teal-700/15 bg-white/60 px-3 py-1.5 text-xl transition-colors hover:border-teal-500/40 dark:border-teal-300/15 dark:bg-ink-900/40"
          >
            {tile.word}
          </button>
        ))}
      </div>

      {result === false && (
        <p className="font-arabic mt-3 text-right text-lg text-leaf-500" dir="rtl">
          {correctLabel}
        </p>
      )}
    </div>
  )
}
