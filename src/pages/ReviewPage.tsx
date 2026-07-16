import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { findExerciseById } from '../data/stories'
import { ExerciseRenderer } from '../components/ExerciseRenderer'

export function ReviewPage() {
  const mistakeQueue = useProgressStore((s) => s.mistakeQueue)
  const [snapshot] = useState(() => [...mistakeQueue])
  const [index, setIndex] = useState(0)

  const exerciseIds = snapshot.map(findExerciseById).filter((e): e is NonNullable<typeof e> => Boolean(e))

  if (exerciseIds.length === 0) {
    return (
      <div className="rounded-2xl border border-teal-700/10 bg-white/60 p-8 text-center dark:border-teal-100/10 dark:bg-ink-900/40">
        <p className="text-3xl">🧹</p>
        <h1 className="mt-2 text-xl font-bold text-ink-900 dark:text-parchment-50">Nothing to review</h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
          Exercises you get wrong in a story land here so you can retry them later.
        </p>
        <Link to="/stories" className="mt-4 inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 dark:bg-teal-500 dark:text-ink-950">
          Go to stories
        </Link>
      </div>
    )
  }

  if (index >= exerciseIds.length) {
    return (
      <div className="rounded-2xl border border-leaf-500/40 bg-leaf-100 p-8 text-center dark:border-leaf-500/30 dark:bg-leaf-500/10">
        <p className="text-3xl">✅</p>
        <h1 className="mt-2 text-xl font-bold text-ink-900 dark:text-parchment-50">Review complete</h1>
        <p className="mt-1 text-sm text-ink-700 dark:text-parchment-200/90">
          You went through everything in your queue. Anything you got right just now has been cleared.
        </p>
        <Link to="/" className="mt-4 inline-block rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 dark:bg-teal-500 dark:text-ink-950">
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Review your mistakes</h1>
      <p className="mt-1 mb-6 text-sm text-ink-600 dark:text-parchment-200/80">
        Item {index + 1} of {exerciseIds.length}
      </p>
      <ExerciseRenderer key={exerciseIds[index].id} exercise={exerciseIds[index]} onContinue={() => setIndex((i) => i + 1)} />
    </div>
  )
}
