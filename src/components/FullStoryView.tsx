import { useState } from 'react'
import type { NarrationSegment, Story } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { glossSegment } from '../lib/wordGloss'

type DisplayMode = 'arabic' | 'both' | 'english'

const MODES: { mode: DisplayMode; label: string }[] = [
  { mode: 'arabic', label: 'Arabic only' },
  { mode: 'both', label: 'Arabic + English' },
  { mode: 'english', label: 'English only' },
]

/**
 * Reading mode: the whole story as continuous text in one view — no clicking
 * through, no exercises, no grammar interruptions. A single segmented control
 * switches between Arabic-only, Arabic+English, and English-only (for
 * self-testing your own translation) without remounting the list, so the
 * toggle never disturbs your scroll position. Tapping any Arabic word shows
 * just that word's meaning, independent of the sentence-level mode.
 */
export function FullStoryView({ story }: { story: Story }) {
  const [mode, setMode] = useState<DisplayMode>('arabic')
  const [openToken, setOpenToken] = useState<string | null>(null)
  const { speak, supported } = useSpeech()

  const narrations = story.segments.filter((s): s is NarrationSegment => s.kind === 'narration')
  const showArabic = mode !== 'english'
  const showEnglish = mode !== 'arabic'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-full border border-teal-700/15 bg-white/60 p-1 dark:border-teal-100/15 dark:bg-ink-900/40">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setMode(m.mode)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                mode === m.mode
                  ? 'bg-teal-700 text-parchment-50 dark:bg-teal-500 dark:text-ink-950'
                  : 'text-ink-600 hover:bg-teal-700/10 dark:text-parchment-200/80 dark:hover:bg-teal-300/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'english' && (
        <p className="mb-4 text-center text-xs text-ink-500 dark:text-parchment-200/50">
          Try writing the Arabic yourself, then switch to "Arabic only" to check.
        </p>
      )}

      <div className="rounded-2xl border border-teal-700/10 bg-white/60 p-6 sm:p-8 dark:border-teal-100/10 dark:bg-ink-900/40">
        <div className="space-y-6">
          {narrations.map((seg) => {
            const tokens = showArabic ? glossSegment(seg) : []
            return (
              <div key={seg.id}>
                {showArabic && (
                  <div className="flex items-start justify-end gap-2">
                    <p className="font-arabic flex flex-wrap justify-end gap-x-2 text-right text-3xl leading-loose text-ink-900 dark:text-parchment-50" lang="ar" dir="rtl">
                      {tokens.map((tok, i) => {
                        const key = `${seg.id}:${i}`
                        const open = openToken === key
                        return (
                          <span key={key} className="relative inline-block">
                            <span
                              role={tok.meaning ? 'button' : undefined}
                              onClick={() => tok.meaning && setOpenToken(open ? null : key)}
                              className={`rounded px-0.5 transition-colors ${
                                tok.meaning ? 'cursor-pointer hover:bg-gold-200/50 dark:hover:bg-gold-700/20' : ''
                              } ${open ? 'bg-gold-200/60 dark:bg-gold-700/30' : ''}`}
                            >
                              {tok.arabic}
                            </span>
                            {open && tok.meaning && (
                              <span
                                dir="ltr"
                                className="absolute left-1/2 top-full z-10 mt-1 w-max max-w-[10rem] -translate-x-1/2 rounded-lg border border-gold-400/50 bg-parchment-50 px-2 py-1 text-left text-xs font-sans font-normal normal-case text-ink-800 shadow-md dark:border-gold-500/40 dark:bg-ink-900 dark:text-parchment-100"
                              >
                                {tok.transliteration && <span className="block italic text-teal-700 dark:text-teal-300">{tok.transliteration}</span>}
                                <span className="block">{tok.meaning}</span>
                              </span>
                            )}
                          </span>
                        )
                      })}
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
                )}
                {showEnglish && (
                  <div className={showArabic ? 'mt-1 text-right' : 'flex items-start justify-between gap-2 text-left'}>
                    <div>
                      {seg.transliteration && showArabic && <p className="text-sm italic text-teal-700 dark:text-teal-300">{seg.transliteration}</p>}
                      <p className={showArabic ? 'text-sm text-ink-600 dark:text-parchment-200/80' : 'text-lg text-ink-900 dark:text-parchment-50'}>
                        {seg.english}
                      </p>
                    </div>
                    {!showArabic && supported && (
                      <button
                        type="button"
                        onClick={() => speak(seg.arabic)}
                        aria-label="Listen"
                        className="mt-1 shrink-0 rounded-full p-1 text-teal-600 hover:bg-teal-700/10 dark:text-teal-300"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
