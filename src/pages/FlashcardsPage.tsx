import { useState } from 'react'
import { words } from '../data/words'
import { stories } from '../data/stories'
import { getStoryDeck } from '../lib/storyDecks'
import { useDueWords } from '../hooks/useLeitner'
import { FlashcardDeck } from '../components/FlashcardDeck'
import { useProgressStore } from '../store/progressStore'
import { isWordInScope } from '../lib/lessonScope'
import type { FlashcardItem } from '../types'

const MAX_PICK_WORDS = 5

export function FlashcardsPage() {
  const [tab, setTab] = useState<'story' | 'pick'>('story')
  const [phase, setPhase] = useState<'choose' | 'session' | 'done'>('choose')
  const [activeDeck, setActiveDeck] = useState<FlashcardItem[]>([])

  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const pickableWords = words.filter((w) => isWordInScope(w, currentStoryId))
  const dueWords = useDueWords(MAX_PICK_WORDS)
  const [selected, setSelected] = useState<string[]>(() => dueWords.map((w) => w.id))

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_PICK_WORDS) return prev
      return [...prev, id]
    })
  }

  const startStoryDeck = (storyId: string) => {
    setActiveDeck(getStoryDeck(storyId))
    setPhase('session')
  }

  const startPickDeck = () => {
    setActiveDeck(words.filter((w) => selected.includes(w.id)).map((w) => ({ ...w, category: 'Vocabulary' })))
    setPhase('session')
  }

  if (phase === 'session') {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink-900 dark:text-parchment-50">Flashcard session</h1>
        <FlashcardDeck cards={activeDeck} onDone={() => setPhase('done')} />
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="rounded-2xl border border-leaf-500/40 bg-leaf-100 p-8 text-center dark:border-leaf-500/30 dark:bg-leaf-500/10">
        <p className="text-3xl">🌟</p>
        <h1 className="mt-2 text-xl font-bold text-ink-900 dark:text-parchment-50">Session complete</h1>
        <p className="mt-1 text-sm text-ink-700 dark:text-parchment-200/90">Nice work — your progress on these cards has been saved.</p>
        <button
          type="button"
          onClick={() => setPhase('choose')}
          className="mt-4 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 dark:bg-teal-500 dark:text-ink-950"
        >
          Study more
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Flashcards</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        One deck per story — every word that story teaches. Or pick your own words for a quick review.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('story')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            tab === 'story' ? 'bg-teal-700 text-parchment-50 dark:bg-teal-500 dark:text-ink-950' : 'bg-teal-700/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-300'
          }`}
        >
          By story
        </button>
        <button
          type="button"
          onClick={() => setTab('pick')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            tab === 'pick' ? 'bg-teal-700 text-parchment-50 dark:bg-teal-500 dark:text-ink-950' : 'bg-teal-700/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-300'
          }`}
        >
          Pick your own
        </button>
      </div>

      {tab === 'story' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stories.map((story) => {
            const deckSize = getStoryDeck(story.id).length
            const isCurrent = story.id === currentStoryId
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => startStoryDeck(story.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  isCurrent
                    ? 'border-gold-500/60 bg-gold-200/20 hover:border-gold-500 dark:border-gold-500/40 dark:bg-gold-700/10'
                    : 'border-teal-700/15 bg-white/60 hover:border-teal-500/40 dark:border-teal-100/15 dark:bg-ink-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                    Story {story.order}
                    {isCurrent && ' · your lesson'}
                  </p>
                  <span aria-hidden>🗂️</span>
                </div>
                <p className="mt-0.5 font-semibold text-ink-900 dark:text-parchment-50">{story.title}</p>
                <p className="mt-1 text-xs text-ink-600 dark:text-parchment-200/70">{deckSize} cards</p>
              </button>
            )
          })}
        </div>
      )}

      {tab === 'pick' && (
        <div className="mt-4">
          <p className="text-sm text-ink-600 dark:text-parchment-200/80">
            Pick up to {MAX_PICK_WORDS} words to drill. Words due for review are pre-selected.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pickableWords.map((w) => {
              const isSelected = selected.includes(w.id)
              const disabled = !isSelected && selected.length >= MAX_PICK_WORDS
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggle(w.id)}
                  disabled={disabled}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border-teal-600 bg-teal-700/10 dark:border-teal-400 dark:bg-teal-300/10'
                      : disabled
                        ? 'border-teal-700/10 bg-transparent opacity-40 dark:border-teal-100/10'
                        : 'border-teal-700/10 bg-white/50 hover:border-teal-500/40 dark:border-teal-100/10 dark:bg-ink-900/30'
                  }`}
                >
                  <span>
                    <span className="font-arabic block text-lg text-ink-900 dark:text-parchment-50" dir="rtl">
                      {w.arabic}
                    </span>
                    <span className="block text-xs text-ink-600 dark:text-parchment-200/70">{w.meaning}</span>
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                      isSelected ? 'border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-400' : 'border-teal-700/30 dark:border-teal-100/30'
                    }`}
                  >
                    {isSelected && '✓'}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="sticky bottom-4 mt-6 flex justify-center">
            <button
              type="button"
              onClick={startPickDeck}
              disabled={selected.length === 0}
              className="rounded-full bg-teal-700 px-8 py-3 text-sm font-semibold text-parchment-50 shadow-lg transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-teal-500 dark:text-ink-950"
            >
              Start session ({selected.length}/{MAX_PICK_WORDS})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
