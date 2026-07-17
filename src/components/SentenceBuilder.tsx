import { useMemo, useState } from 'react'
import { sentenceBuilderSet, type BuilderSentence } from '../lib/sentenceBuilderSet'
import { useProgressStore } from '../store/progressStore'
import { storiesUpTo } from '../lib/lessonScope'

interface Tile {
  word: string
  uid: number
}

function shuffledTiles(sentence: BuilderSentence): Tile[] {
  return sentence.tiles
    .map((word, uid) => ({ word, uid, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ word, uid }) => ({ word, uid }))
}

export function SentenceBuilder() {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const pool = useMemo(() => {
    const allowed = new Set(storiesUpTo(currentStoryId).map((s) => s.id))
    const scoped = sentenceBuilderSet.filter((s) => allowed.has(s.storyId))
    return scoped.length > 0 ? scoped : sentenceBuilderSet
  }, [currentStoryId])
  const [order] = useState<number[]>(() => pool.map((_, i) => i).sort(() => Math.random() - 0.5))
  const sentencePool = pool
  const [pos, setPos] = useState(0)
  const sentence = sentencePool[order[pos] % sentencePool.length]

  const [available, setAvailable] = useState<Tile[]>(() => shuffledTiles(sentence))
  const [placed, setPlaced] = useState<Tile[]>([])
  const [result, setResult] = useState<boolean | null>(null)

  const correctLabel = useMemo(() => sentence.correctOrder.join(' '), [sentence])

  const place = (tile: Tile) => {
    if (result !== null) return
    const nextPlaced = [...placed, tile]
    setPlaced(nextPlaced)
    setAvailable(available.filter((t) => t.uid !== tile.uid))
    if (nextPlaced.length === sentence.tiles.length) {
      setResult(nextPlaced.map((t) => t.word).join(' ') === correctLabel)
    }
  }

  const unplace = (tile: Tile) => {
    if (result !== null) return
    setPlaced(placed.filter((t) => t.uid !== tile.uid))
    setAvailable([...available, tile])
  }

  const nextSentence = () => {
    const next = (pos + 1) % order.length
    setPos(next)
    const nextSentenceData = sentencePool[order[next] % sentencePool.length]
    setAvailable(shuffledTiles(nextSentenceData))
    setPlaced([])
    setResult(null)
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
        Sentence {pos + 1} of {order.length}
      </p>
      <p className="mb-4 text-lg font-semibold text-ink-900 dark:text-parchment-50">Build: "{sentence.englishGloss}"</p>

      <div
        className="mb-4 flex min-h-16 flex-wrap-reverse items-center justify-end gap-2 rounded-xl border-2 border-dashed border-teal-700/25 p-3 dark:border-teal-300/20"
        dir="rtl"
      >
        {placed.length === 0 && (
          <span className="text-sm text-ink-500 dark:text-parchment-200/50">Tap the words below, in order →</span>
        )}
        {placed.map((tile) => (
          <button
            key={tile.uid}
            type="button"
            onClick={() => unplace(tile)}
            disabled={result !== null}
            className={`font-arabic rounded-lg border px-4 py-2 text-2xl ${
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
            className="font-arabic rounded-lg border border-teal-700/15 bg-white/60 px-4 py-2 text-2xl transition-colors hover:border-teal-500/40 dark:border-teal-100/15 dark:bg-ink-900/40"
          >
            {tile.word}
          </button>
        ))}
      </div>

      {result !== null && (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            result
              ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
              : 'border-rose-500/40 bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10'
          }`}
        >
          <p className="font-semibold text-ink-900 dark:text-parchment-50">{result ? '✅ Correct!' : 'Not quite'}</p>
          {!result && (
            <p className="font-arabic mt-1 text-right text-xl text-ink-900 dark:text-parchment-50" dir="rtl">
              {correctLabel}
            </p>
          )}
          <p className="mt-2 text-sm text-ink-700 dark:text-parchment-200/90">{sentence.explanation}</p>
          <button
            type="button"
            onClick={nextSentence}
            className="mt-3 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
          >
            Next sentence →
          </button>
        </div>
      )}
    </div>
  )
}
