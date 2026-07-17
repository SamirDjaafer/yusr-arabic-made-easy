import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { getStoryById } from '../data/stories'
import { getWordById } from '../data/words'
import { comprehension } from '../data/comprehension'
import type { NarrationSegment } from '../types'

const FUNCTION_POS = new Set(['particle', 'preposition', 'pronoun', 'demonstrative', 'relative-pronoun'])

type ChallengeId = 'own-sentences' | 'translate' | 'comprehension'

export function ChallengesPage() {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const challenges = useProgressStore((s) => s.challenges)
  const story = getStoryById(currentStoryId)
  const [active, setActive] = useState<ChallengeId | null>(null)

  if (!story) return null

  if (active === 'own-sentences') return <OwnSentences storyId={currentStoryId} onExit={() => setActive(null)} />
  if (active === 'translate') return <TranslateChallenge storyId={currentStoryId} onExit={() => setActive(null)} />
  if (active === 'comprehension') return <ComprehensionChallenge storyId={currentStoryId} onExit={() => setActive(null)} />

  const state = challenges[currentStoryId] ?? {}
  const items: { id: ChallengeId; icon: string; title: string; blurb: string }[] = [
    {
      id: 'own-sentences',
      icon: '🏆',
      title: 'Challenge 1 — Your own sentences',
      blurb: `Write your own sentence using each key word from "${story.title}".`,
    },
    {
      id: 'translate',
      icon: '🏆',
      title: 'Challenge 2 — Translate into Arabic',
      blurb: 'Translate each English sentence into Arabic, then reveal the model answer and grade yourself.',
    },
    {
      id: 'comprehension',
      icon: '💬',
      title: 'Comprehension',
      blurb: 'Answer questions about the story in a full Arabic sentence.',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Lesson {story.order} challenges</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        Deeper, production-focused work on "{story.title}" — write real Arabic, then compare against model answers.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((c) => {
          const submitted = state[c.id]?.submitted
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className="block w-full rounded-2xl border border-teal-700/15 bg-white/60 p-5 text-left transition-colors hover:border-gold-500/50 dark:border-teal-100/15 dark:bg-ink-900/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${submitted ? 'text-leaf-500' : 'text-ink-600 dark:text-parchment-200/60'}`}>
                    {submitted ? '✓ Submitted' : 'Not submitted yet'}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink-900 dark:text-parchment-50">{c.title}</h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">{c.blurb}</p>
                </div>
                <span className="text-2xl" aria-hidden>
                  {c.icon}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const cardClass = 'rounded-2xl border border-teal-700/15 bg-white/60 p-5 dark:border-teal-100/15 dark:bg-ink-900/40'
const primaryBtn =
  'rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950'
const inputClass =
  'font-arabic w-full rounded-xl border border-teal-700/20 bg-parchment-50/70 px-3 py-2 text-xl leading-loose outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40'

function BackBar({ onExit, title }: { onExit: () => void; title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button type="button" onClick={onExit} className="text-sm font-semibold text-teal-700 dark:text-teal-300">
        ← Save & back
      </button>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-parchment-200/70">{title}</p>
    </div>
  )
}

function OwnSentences({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const story = getStoryById(storyId)!
  const saved = useProgressStore((s) => s.challenges[storyId]?.['own-sentences'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)

  const keyWords = useMemo(
    () =>
      story.newWordIds
        .map((id) => getWordById(id))
        .filter((w): w is NonNullable<typeof w> => Boolean(w) && !FUNCTION_POS.has(w!.partOfSpeech))
        .slice(0, 15),
    [story],
  )

  const [answers, setAnswers] = useState<string[]>(() => saved?.answers ?? keyWords.map(() => ''))

  const filled = answers.filter((a) => a.trim().length > 0).length

  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'own-sentences', answers, submitted)
    if (submitted) onExit()
  }

  return (
    <div>
      <BackBar onExit={() => save(saved?.submitted ?? false)} title={`Your own sentences — ${filled}/${keyWords.length}`} />
      <p className="mb-4 text-sm text-ink-600 dark:text-parchment-200/80">
        Write one original Arabic sentence for each key word. Check any sentence against the rules in the{' '}
        <Link to="/lab" className="font-medium text-teal-700 underline dark:text-teal-300">
          Sentence Lab
        </Link>
        .
      </p>
      <div className="space-y-3">
        {keyWords.map((w, i) => (
          <div key={w.id} className={cardClass}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-xs text-ink-600 dark:text-parchment-200/70">
                {i + 1}. {w.meaning}
              </span>
              <span className="font-arabic text-2xl text-ink-900 dark:text-parchment-50" dir="rtl">
                {w.arabic}
              </span>
            </div>
            <textarea
              value={answers[i] ?? ''}
              onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
              dir="rtl"
              rows={1}
              placeholder="اكتب جملتك هنا..."
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => save(false)} className="rounded-full border border-teal-700/30 bg-white/90 px-5 py-2 text-sm font-semibold text-teal-700 dark:border-teal-300/30 dark:bg-ink-900 dark:text-teal-300">
          Save draft
        </button>
        <button type="button" onClick={() => save(true)} disabled={filled === 0} className={`${primaryBtn} disabled:opacity-40`}>
          Submit ({filled}/{keyWords.length})
        </button>
      </div>
    </div>
  )
}

function TranslateChallenge({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const story = getStoryById(storyId)!
  const saved = useProgressStore((s) => s.challenges[storyId]?.['translate'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)

  const sentences = useMemo(
    () => story.segments.filter((s): s is NarrationSegment => s.kind === 'narration').slice(0, 8),
    [story],
  )

  const [answers, setAnswers] = useState<string[]>(() => saved?.answers ?? sentences.map(() => ''))
  const [revealed, setRevealed] = useState<boolean[]>(() => sentences.map(() => false))

  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'translate', answers, submitted)
    if (submitted) onExit()
  }

  const allRevealed = revealed.every(Boolean)

  return (
    <div>
      <BackBar onExit={() => save(saved?.submitted ?? false)} title="Translate into Arabic" />
      <p className="mb-4 text-sm text-ink-600 dark:text-parchment-200/80">
        Translate each sentence into Arabic (with harakat if you can), then reveal the model — it's the story's own
        line — and compare honestly.
      </p>
      <div className="space-y-3">
        {sentences.map((seg, i) => (
          <div key={seg.id} className={cardClass}>
            <p className="text-sm font-semibold text-ink-900 dark:text-parchment-50">
              {i + 1}. {seg.english}
            </p>
            <textarea
              value={answers[i] ?? ''}
              onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
              dir="rtl"
              rows={1}
              placeholder="اكتب الترجمة هنا..."
              className={`${inputClass} mt-2`}
            />
            {!revealed[i] ? (
              <button
                type="button"
                onClick={() => setRevealed((prev) => prev.map((r, j) => (j === i ? true : r)))}
                className="mt-2 rounded-full border border-teal-700/20 px-4 py-1.5 text-xs font-semibold text-teal-700 dark:border-teal-100/20 dark:text-teal-300"
              >
                Reveal model answer
              </button>
            ) : (
              <div className="mt-2 rounded-xl border border-leaf-500/30 bg-leaf-100/60 p-3 text-right dark:bg-leaf-500/10">
                <p className="font-arabic text-xl text-ink-900 dark:text-parchment-50" dir="rtl">
                  {seg.arabic}
                </p>
                <p className="mt-0.5 text-xs italic text-teal-700 dark:text-teal-300">{seg.transliteration}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => save(false)} className="rounded-full border border-teal-700/30 bg-white/90 px-5 py-2 text-sm font-semibold text-teal-700 dark:border-teal-300/30 dark:bg-ink-900 dark:text-teal-300">
          Save draft
        </button>
        <button type="button" onClick={() => save(true)} disabled={!allRevealed} className={`${primaryBtn} disabled:opacity-40`}>
          Submit
        </button>
      </div>
    </div>
  )
}

function ComprehensionChallenge({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const saved = useProgressStore((s) => s.challenges[storyId]?.['comprehension'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)
  const items = comprehension[storyId] ?? []

  const [answers, setAnswers] = useState<string[]>(() => saved?.answers ?? items.map(() => ''))
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false))

  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'comprehension', answers, submitted)
    if (submitted) onExit()
  }

  return (
    <div>
      <BackBar onExit={() => save(saved?.submitted ?? false)} title="Comprehension" />
      <p className="mb-4 text-sm text-ink-600 dark:text-parchment-200/80">
        Answer each question about the story in a full Arabic sentence, then reveal the model answer.
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={cardClass}>
            <p className="font-arabic text-right text-2xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
              {item.questionArabic}
            </p>
            <p className="mt-0.5 text-right text-xs italic text-teal-700 dark:text-teal-300">{item.questionTransliteration}</p>
            <p className="mt-0.5 text-right text-xs text-ink-500 dark:text-parchment-200/50">{item.questionEnglish}</p>
            <textarea
              value={answers[i] ?? ''}
              onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
              dir="rtl"
              rows={1}
              placeholder="اكتب جوابك بجملة كاملة..."
              className={`${inputClass} mt-2`}
            />
            {!revealed[i] ? (
              <button
                type="button"
                onClick={() => setRevealed((prev) => prev.map((r, j) => (j === i ? true : r)))}
                className="mt-2 rounded-full border border-teal-700/20 px-4 py-1.5 text-xs font-semibold text-teal-700 dark:border-teal-100/20 dark:text-teal-300"
              >
                Reveal model answer
              </button>
            ) : (
              <div className="mt-2 rounded-xl border border-leaf-500/30 bg-leaf-100/60 p-3 text-right dark:bg-leaf-500/10">
                <p className="font-arabic text-xl text-ink-900 dark:text-parchment-50" dir="rtl">
                  {item.modelArabic}
                </p>
                <p className="mt-0.5 text-xs italic text-teal-700 dark:text-teal-300">{item.modelTransliteration}</p>
                <p className="mt-0.5 text-xs text-ink-600 dark:text-parchment-200/70">{item.modelEnglish}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sticky bottom-4 mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => save(false)} className="rounded-full border border-teal-700/30 bg-white/90 px-5 py-2 text-sm font-semibold text-teal-700 dark:border-teal-300/30 dark:bg-ink-900 dark:text-teal-300">
          Save draft
        </button>
        <button type="button" onClick={() => save(true)} disabled={!revealed.every(Boolean)} className={`${primaryBtn} disabled:opacity-40`}>
          Submit
        </button>
      </div>
    </div>
  )
}
