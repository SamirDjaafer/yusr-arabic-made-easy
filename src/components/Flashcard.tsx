import { motion } from 'framer-motion'
import type { FlashcardItem } from '../types'

export function Flashcard({ card, flipped, onFlip }: { card: FlashcardItem; flipped: boolean; onFlip: () => void }) {
  return (
    <div className="[perspective:1200px]" onClick={onFlip}>
      <motion.div
        className="relative h-56 w-full cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-teal-700/15 bg-white/80 p-6 shadow-md [backface-visibility:hidden] dark:border-teal-100/15 dark:bg-ink-900/60">
          <p className="font-arabic text-5xl text-ink-900 dark:text-parchment-50" dir="rtl">
            {card.arabic}
          </p>
          <p className="mt-4 text-xs text-ink-500 dark:text-parchment-200/50">Tap to reveal</p>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-gold-400/40 bg-gold-200/40 p-6 shadow-md [backface-visibility:hidden] dark:border-gold-500/30 dark:bg-gold-700/15"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="text-2xl font-bold text-ink-900 dark:text-parchment-50">{card.meaning}</p>
          <p className="mt-1 italic text-teal-700 dark:text-teal-300">{card.transliteration}</p>
          {card.root && (
            <p className="font-arabic mt-2 text-lg text-ink-700 dark:text-parchment-200/80" dir="rtl">
              جذر: {card.root}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
