import { useState } from 'react'
import { useSpeech } from '../hooks/useSpeech'

interface ArabicTextProps {
  arabic: string
  transliteration?: string
  english?: string
  size?: 'md' | 'lg' | 'xl'
  className?: string
  /** hide the transliteration/English behind a "Show meaning" button — used in story
      reading so students try the Arabic first instead of reading the answer. */
  concealTranslations?: boolean
}

const SIZE_CLASSES: Record<NonNullable<ArabicTextProps['size']>, string> = {
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl',
  xl: 'text-4xl sm:text-5xl',
}

export function ArabicText({ arabic, transliteration, english, size = 'md', className = '', concealTranslations = false }: ArabicTextProps) {
  const { speak, supported } = useSpeech()
  const [revealed, setRevealed] = useState(!concealTranslations)
  const hasTranslations = Boolean(transliteration || english)

  return (
    <div className={className}>
      <div className="flex items-center justify-end gap-2">
        <p className={`font-arabic leading-loose text-ink-900 dark:text-parchment-50 ${SIZE_CLASSES[size]}`} lang="ar" dir="rtl">
          {arabic}
        </p>
        {supported && (
          <button
            type="button"
            onClick={() => speak(arabic)}
            aria-label="Listen to pronunciation"
            className="shrink-0 rounded-full p-1.5 text-teal-600 transition-colors hover:bg-teal-700/10 dark:text-teal-300 dark:hover:bg-teal-300/10"
          >
            <SpeakerIcon />
          </button>
        )}
      </div>
      {revealed && transliteration && <p className="mt-1 text-right text-sm italic text-teal-700 dark:text-teal-300">{transliteration}</p>}
      {revealed && english && <p className="mt-0.5 text-right text-sm text-ink-600 dark:text-parchment-200/80">{english}</p>}
      {hasTranslations && concealTranslations && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="rounded-full border border-ink-900/15 px-3 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-gold-500/60 hover:bg-gold-200/20"
          >
            {revealed ? 'Hide meaning' : 'Show meaning'}
          </button>
        </div>
      )}
    </div>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M4 9v6h4l5 5V4L8 9H4Z"
        fill="currentColor"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18.7 6.3a8 8 0 0 1 0 11.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
