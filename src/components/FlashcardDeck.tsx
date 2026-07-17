import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FlashcardItem } from '../types'
import { Flashcard } from './Flashcard'
import { useFlashcardStore, type CardGrade } from '../store/flashcardStore'

const RATINGS: { key: CardGrade; label: string; className: string }[] = [
  { key: 'no-idea', label: 'No idea', className: 'bg-rose-500 hover:bg-rose-600 text-white' },
  { key: 'nearly', label: 'Nearly got it', className: 'bg-gold-500 hover:bg-gold-600 text-ink-950' },
  { key: 'got-it', label: 'Got it right!', className: 'bg-leaf-500 hover:bg-leaf-600 text-white' },
]

export function FlashcardDeck({ cards, onDone }: { cards: FlashcardItem[]; onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const gradeCard = useFlashcardStore((s) => s.gradeCard)

  const card = cards[index]
  const isNewCategory = index === 0 || cards[index - 1].category !== card.category

  const { positionInCategory, categoryTotal } = useMemo(() => {
    let total = 0
    let position = 0
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].category === card.category) {
        total += 1
        if (i <= index) position += 1
      }
    }
    return { positionInCategory: position, categoryTotal: total }
  }, [cards, card.category, index])

  const handleRate = (rating: CardGrade) => {
    gradeCard(card.id, rating)
    if (index + 1 >= cards.length) {
      onDone()
    } else {
      setIndex((i) => i + 1)
      setFlipped(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <AnimatePresence mode="wait">
        {isNewCategory && (
          <motion.div
            key={card.category}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-full bg-gold-200/60 px-3 py-1.5 text-center text-xs font-semibold text-gold-700 dark:bg-gold-700/20 dark:text-gold-300"
          >
            Now practicing: {card.category}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
        Card {index + 1} of {cards.length}
      </p>
      <p className="mb-3 text-center text-[11px] text-ink-500 dark:text-parchment-200/50">
        {card.category} — {positionInCategory}/{categoryTotal}
      </p>
      <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      {flipped ? (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => handleRate(r.key)}
              className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${r.className}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-sm text-ink-500 dark:text-parchment-200/50">Tap the card to see the meaning.</p>
      )}
    </div>
  )
}
