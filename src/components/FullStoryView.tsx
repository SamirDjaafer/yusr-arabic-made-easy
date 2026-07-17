import { useState } from 'react'
import type { NarrationSegment, Story } from '../types'
import { useSpeech } from '../hooks/useSpeech'

/**
 * Reading mode: the whole story as continuous text in one view — no clicking
 * through, no exercises, no grammar interruptions. English/transliteration
 * stay hidden behind a single global toggle so reading the Arabic comes first.
 */
export function FullStoryView({ story }: { story: Story }) {
  const [showEnglish, setShowEnglish] = useState(false)
  const { speak, supported } = useSpeech()

  const narrations = story.segments.filter((s): s is NarrationSegment => s.kind === 'narration')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowEnglish((v) => !v)}
          className="rounded-full border border-ink-900/15 px-4 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-gold-500/60 hover:bg-gold-200/20 dark:border-parchment-200/20 dark:text-parchment-200"
        >
          {showEnglish ? 'Hide English' : 'Show English'}
        </button>
      </div>

      <div className="rounded-2xl border border-teal-700/10 bg-white/60 p-6 sm:p-8 dark:border-teal-100/10 dark:bg-ink-900/40">
        <div className="space-y-6">
          {narrations.map((seg) => (
            <div key={seg.id}>
              <div className="flex items-start justify-end gap-2">
                <p className="font-arabic text-right text-3xl leading-loose text-ink-900 dark:text-parchment-50" lang="ar" dir="rtl">
                  {seg.arabic}
                </p>
                {supported && (
                  <button
                    type="button"
                    onClick={() => speak(seg.arabic)}
                    aria-label="Listen"
                    className="mt-2 shrink-0 rounded-full p-1 text-teal-600 hover:bg-teal-700/10 dark:text-teal-300"
                  >
                    🔊
                  </button>
                )}
              </div>
              {showEnglish && (
                <div className="mt-1 text-right">
                  {seg.transliteration && <p className="text-sm italic text-teal-700 dark:text-teal-300">{seg.transliteration}</p>}
                  <p className="text-sm text-ink-600 dark:text-parchment-200/80">{seg.english}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
