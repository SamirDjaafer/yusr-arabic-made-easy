import { useMemo, useState } from 'react'
import type { MatchingExercise } from '../../types'

interface Tile {
  pairIndex: number
  text: string
}

function shuffled<T>(arr: T[]): T[] {
  return [...arr]
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)
}

export function Matching({
  exercise,
  onSubmit,
}: {
  exercise: MatchingExercise
  onSubmit: (correct: boolean, correctAnswerLabel?: string) => void
}) {
  const arabicTiles = useMemo<Tile[]>(
    () => shuffled(exercise.pairs.map((p, pairIndex) => ({ pairIndex, text: p.arabic }))),
    [exercise.pairs],
  )
  const englishTiles = useMemo<Tile[]>(
    () => shuffled(exercise.pairs.map((p, pairIndex) => ({ pairIndex, text: p.english }))),
    [exercise.pairs],
  )

  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selectedArabic, setSelectedArabic] = useState<number | null>(null)
  const [selectedEnglish, setSelectedEnglish] = useState<number | null>(null)
  const [wrongPulse, setWrongPulse] = useState(false)
  const [hadMistake, setHadMistake] = useState(false)
  const [done, setDone] = useState(false)

  const pickArabic = (pairIndex: number) => {
    if (done || matched.has(pairIndex) || wrongPulse) return
    setSelectedArabic(pairIndex)
    if (selectedEnglish !== null) evaluate(pairIndex, selectedEnglish)
  }

  const pickEnglish = (pairIndex: number) => {
    if (done || matched.has(pairIndex) || wrongPulse) return
    setSelectedEnglish(pairIndex)
    if (selectedArabic !== null) evaluate(selectedArabic, pairIndex)
  }

  const evaluate = (arabicPair: number, englishPair: number) => {
    if (arabicPair === englishPair) {
      const nextMatched = new Set(matched)
      nextMatched.add(arabicPair)
      setMatched(nextMatched)
      setSelectedArabic(null)
      setSelectedEnglish(null)
      if (nextMatched.size === exercise.pairs.length) {
        setDone(true)
        onSubmit(!hadMistake)
      }
    } else {
      setHadMistake(true)
      setWrongPulse(true)
      setTimeout(() => {
        setWrongPulse(false)
        setSelectedArabic(null)
        setSelectedEnglish(null)
      }, 500)
    }
  }

  const tileClass = (isMatched: boolean, isSelected: boolean) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm transition-colors ${
      isMatched
        ? 'border-leaf-500 bg-leaf-100 text-ink-500 dark:bg-leaf-500/15 dark:text-parchment-200/50'
        : isSelected && wrongPulse
          ? 'border-rose-500 bg-rose-100 dark:bg-rose-500/15'
          : isSelected
            ? 'border-gold-500 bg-gold-200/50 dark:bg-gold-700/20'
            : 'border-teal-700/15 bg-white/60 hover:border-teal-500/40 dark:border-teal-300/15 dark:bg-ink-900/40'
    }`

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {arabicTiles.map((tile) => (
          <button
            key={tile.pairIndex}
            type="button"
            dir="rtl"
            onClick={() => pickArabic(tile.pairIndex)}
            disabled={matched.has(tile.pairIndex)}
            className={`font-arabic text-xl ${tileClass(matched.has(tile.pairIndex), selectedArabic === tile.pairIndex)}`}
          >
            {tile.text}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {englishTiles.map((tile) => (
          <button
            key={tile.pairIndex}
            type="button"
            onClick={() => pickEnglish(tile.pairIndex)}
            disabled={matched.has(tile.pairIndex)}
            className={tileClass(matched.has(tile.pairIndex), selectedEnglish === tile.pairIndex)}
          >
            {tile.text}
          </button>
        ))}
      </div>
    </div>
  )
}
