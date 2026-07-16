import { useState } from 'react'
import { getWordById } from '../data/words'

export function WordChip({ wordId }: { wordId: string }) {
  const [open, setOpen] = useState(false)
  const word = getWordById(wordId)
  if (!word) return null

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={`inline-flex flex-col items-end rounded-lg border px-2.5 py-1 text-right transition-colors ${
        open
          ? 'border-gold-400 bg-gold-200/50 dark:border-gold-500 dark:bg-gold-700/20'
          : 'border-teal-700/15 bg-teal-700/5 hover:border-teal-500/40 dark:border-teal-300/15 dark:bg-teal-300/5'
      }`}
    >
      <span className="font-arabic text-lg text-ink-900 dark:text-parchment-50" dir="rtl">
        {word.arabic}
      </span>
      {open && (
        <span className="mt-1 max-w-[10rem] text-left text-xs text-ink-600 dark:text-parchment-200/80">
          <span className="block italic text-teal-700 dark:text-teal-300">{word.transliteration}</span>
          <span className="block">{word.meaning}</span>
          {word.root && <span className="block font-arabic text-sm" dir="rtl">جذر: {word.root}</span>}
        </span>
      )}
    </button>
  )
}
