import { useState } from 'react'
import { stories } from '../data/stories'
import { getStoryDeck } from '../lib/storyDecks'
import { FlashcardDeck } from '../components/FlashcardDeck'
import { useProgressStore } from '../store/progressStore'
import { useFlashcardStore } from '../store/flashcardStore'
import type { FlashcardItem } from '../types'

export function FlashcardsPage() {
  const [activeDeck, setActiveDeck] = useState<FlashcardItem[] | null>(null)
  const [phase, setPhase] = useState<'decks' | 'session' | 'done'>('decks')
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const mastered = useFlashcardStore((s) => s.mastered)

  const startDeck = (storyId: string) => {
    const deck = getStoryDeck(storyId)
    // unmastered cards first, so repeat sessions focus on what's left
    const sorted = [...deck].sort((a, b) => Number(Boolean(mastered[a.id])) - Number(Boolean(mastered[b.id])))
    setActiveDeck(sorted)
    setPhase('session')
  }

  if (phase === 'session' && activeDeck) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink-900 dark:text-parchment-50">Memorise vocab</h1>
        <FlashcardDeck cards={activeDeck} onDone={() => setPhase('done')} />
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="rounded-2xl border border-leaf-500/40 bg-leaf-100 p-8 text-center dark:border-leaf-500/30 dark:bg-leaf-500/10">
        <p className="text-3xl">🌟</p>
        <h1 className="mt-2 text-xl font-bold text-ink-900 dark:text-parchment-50">Deck finished</h1>
        <p className="mt-1 text-sm text-ink-700 dark:text-parchment-200/90">
          Cards you graded "Got it right!" count toward mastery — run the deck again to clear the rest.
        </p>
        <button
          type="button"
          onClick={() => setPhase('decks')}
          className="mt-4 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 dark:bg-teal-500 dark:text-ink-950"
        >
          ← Decks
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Memorise vocab</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        One deck per lesson. Flip each card, grade yourself honestly, and master every card in the deck.
      </p>

      <div className="mt-6 space-y-3">
        {stories.map((story) => {
          const deck = getStoryDeck(story.id)
          const masteredCount = deck.filter((c) => mastered[c.id]).length
          const pct = deck.length > 0 ? Math.round((masteredCount / deck.length) * 100) : 0
          const remaining = deck.length - masteredCount
          const complete = remaining === 0 && deck.length > 0
          const isCurrent = story.id === currentStoryId
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => startDeck(story.id)}
              className={`block w-full rounded-2xl border p-5 text-left transition-colors hover:border-gold-500/60 ${
                isCurrent
                  ? 'border-gold-500/50 bg-gold-200/15 dark:border-gold-500/40 dark:bg-gold-700/10'
                  : 'border-teal-700/15 bg-white/60 dark:border-teal-100/15 dark:bg-ink-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wide ${complete ? 'text-leaf-500' : 'text-gold-600 dark:text-gold-300'}`}>
                    {complete ? 'Completed 100%' : `Progress: ${pct}%`}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-600 dark:text-parchment-200/70">
                    {complete ? '0 cards until mastery' : `${remaining} cards until mastery`}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink-900 dark:text-parchment-50">
                    Lesson {story.order}: {story.title}
                    {isCurrent && <span className="ml-2 text-xs font-semibold text-gold-600 dark:text-gold-300">· your lesson</span>}
                  </h2>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-teal-700/10 dark:bg-teal-300/10">
                    <div className={`h-full rounded-full ${complete ? 'bg-leaf-500' : 'bg-gold-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-2xl" aria-hidden>
                  🃏
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
