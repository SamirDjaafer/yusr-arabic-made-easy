import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { getStoryById } from '../data/stories'
import { getWordById } from '../data/words'
import { comprehension } from '../data/comprehension'
import { challenge1Words, challenge2Sentences, comprehensionPool } from '../data/original/adapter'
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

const cardClass = 'rounded-2xl border border-teal-700/15 bg-white/60 p-6 dark:border-teal-100/15 dark:bg-ink-900/40'
const primaryBtn =
  'rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 disabled:opacity-40 dark:bg-teal-500 dark:text-ink-950'
const ghostBtn =
  'rounded-full border border-teal-700/25 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-700/10 disabled:opacity-40 dark:border-teal-100/25 dark:text-teal-300'
const revealBtn =
  'rounded-full border border-ink-900/15 px-3 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-gold-500/60 hover:bg-gold-200/20'
const inputClass =
  'font-arabic w-full rounded-xl border border-teal-700/20 bg-parchment-50/70 px-3 py-2 text-xl leading-loose outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40'

function ChallengeFrame({
  title,
  index,
  total,
  onExit,
  onPrev,
  onNext,
  onSubmit,
  children,
}: {
  title: string
  index: number
  total: number
  onExit: () => void
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  children: React.ReactNode
}) {
  const isLast = index === total - 1
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onExit} className="text-sm font-semibold text-teal-700 dark:text-teal-300">
          ← Save & back
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-parchment-200/70">
          {title} · {index + 1} / {total}
        </p>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-teal-700/10 dark:bg-teal-300/10">
        <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {children}

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={onPrev} disabled={index === 0} className={ghostBtn}>
          ‹ Previous
        </button>
        {isLast ? (
          <button type="button" onClick={onSubmit} className={primaryBtn}>
            Submit challenge
          </button>
        ) : (
          <button type="button" onClick={onNext} className={primaryBtn}>
            Next ›
          </button>
        )}
      </div>
    </div>
  )
}

function OwnSentences({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const story = getStoryById(storyId)!
  const saved = useProgressStore((s) => s.challenges[storyId]?.['own-sentences'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)

  const keyWords = useMemo(() => {
    const pool = challenge1Words(story.order)
    if (pool.length > 0) return pool.map((w, i) => ({ id: `c1-${i}`, arabic: w.ar, meaning: w.en }))
    return story.newWordIds
      .map((id) => getWordById(id))
      .filter((w): w is NonNullable<typeof w> => Boolean(w) && !FUNCTION_POS.has(w!.partOfSpeech))
      .slice(0, 15)
      .map((w) => ({ id: w.id, arabic: w.arabic, meaning: w.meaning }))
  }, [story])

  const [answers, setAnswers] = useState<string[]>(() => {
    const base = keyWords.map(() => '')
    saved?.answers?.forEach((a, i) => { if (i < base.length) base[i] = a })
    return base
  })
  const [index, setIndex] = useState(0)
  const [meaningShown, setMeaningShown] = useState(false)

  const word = keyWords[index]
  const go = (next: number) => {
    setIndex(next)
    setMeaningShown(false)
  }
  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'own-sentences', answers, submitted || (saved?.submitted ?? false))
    onExit()
  }

  return (
    <ChallengeFrame
      title="Your own sentences"
      index={index}
      total={keyWords.length}
      onExit={() => save(false)}
      onPrev={() => go(Math.max(0, index - 1))}
      onNext={() => go(index + 1)}
      onSubmit={() => save(true)}
    >
      <div className={cardClass}>
        <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
          Write one original sentence using this word
        </p>
        <p className="font-arabic mt-3 text-right text-4xl leading-relaxed text-ink-900 dark:text-parchment-50" dir="rtl">
          {word.arabic}
        </p>
        <div className="mt-2 flex justify-end">
          {meaningShown ? (
            <p className="text-xs text-ink-600 dark:text-parchment-200/70">{word.meaning}</p>
          ) : (
            <button type="button" onClick={() => setMeaningShown(true)} className={revealBtn}>
              Show meaning
            </button>
          )}
        </div>
        <textarea
          value={answers[index] ?? ''}
          onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === index ? e.target.value : a)))}
          dir="rtl"
          rows={2}
          placeholder="اكتب جملتك هنا..."
          className={`${inputClass} mt-3`}
        />
        <p className="mt-2 text-xs text-ink-500 dark:text-parchment-200/50">
          Tip: check your sentence in the{' '}
          <Link to="/lab" className="font-medium text-teal-700 underline dark:text-teal-300">
            Sentence Lab
          </Link>{' '}
          before moving on.
        </p>
      </div>
    </ChallengeFrame>
  )
}

function TranslateChallenge({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const story = getStoryById(storyId)!
  const saved = useProgressStore((s) => s.challenges[storyId]?.['translate'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)

  const sentences = useMemo(() => {
    const pool = challenge2Sentences(story.order)
    if (pool.length > 0) return pool.map((q, i) => ({ id: `c2-${i}`, english: q.en, arabic: q.ar, transliteration: '' }))
    return story.segments
      .filter((s): s is NarrationSegment => s.kind === 'narration')
      .slice(0, 8)
      .map((seg) => ({ id: seg.id, english: seg.english, arabic: seg.arabic, transliteration: seg.transliteration }))
  }, [story])

  const [answers, setAnswers] = useState<string[]>(() => {
    const base = sentences.map(() => '')
    saved?.answers?.forEach((a, i) => { if (i < base.length) base[i] = a })
    return base
  })
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const seg = sentences[index]
  const go = (next: number) => {
    setIndex(next)
    setRevealed(false)
  }
  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'translate', answers, submitted || (saved?.submitted ?? false))
    onExit()
  }

  return (
    <ChallengeFrame
      title="Translate into Arabic"
      index={index}
      total={sentences.length}
      onExit={() => save(false)}
      onPrev={() => go(Math.max(0, index - 1))}
      onNext={() => go(index + 1)}
      onSubmit={() => save(true)}
    >
      <div className={cardClass}>
        <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
          Translate this sentence into Arabic
        </p>
        <p className="mt-3 text-xl font-semibold text-ink-900 dark:text-parchment-50">{seg.english}</p>
        <textarea
          value={answers[index] ?? ''}
          onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === index ? e.target.value : a)))}
          dir="rtl"
          rows={2}
          placeholder="اكتب الترجمة هنا..."
          className={`${inputClass} mt-3`}
        />
        {!revealed ? (
          <button type="button" onClick={() => setRevealed(true)} className={`${ghostBtn} mt-3`}>
            Reveal model answer
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-leaf-500/30 bg-leaf-100/60 p-4 text-right dark:bg-leaf-500/10">
            <p className="font-arabic text-2xl text-ink-900 dark:text-parchment-50" dir="rtl">
              {seg.arabic}
            </p>
            {seg.transliteration && <p className="mt-1 text-xs italic text-teal-700 dark:text-teal-300">{seg.transliteration}</p>}
          </div>
        )}
      </div>
    </ChallengeFrame>
  )
}

function ComprehensionChallenge({ storyId, onExit }: { storyId: string; onExit: () => void }) {
  const saved = useProgressStore((s) => s.challenges[storyId]?.['comprehension'])
  const saveChallenge = useProgressStore((s) => s.saveChallenge)
  const story = getStoryById(storyId)
  const items = useMemo(() => {
    const ours = comprehension[storyId]
    if (ours && ours.length > 0) return ours
    return comprehensionPool(story?.order ?? 0).map((q) => ({
      questionArabic: q.ar,
      questionTransliteration: '',
      questionEnglish: q.en,
      modelArabic: '',
      modelTransliteration: '',
      modelEnglish: '',
    }))
  }, [storyId, story])

  const [answers, setAnswers] = useState<string[]>(() => {
    const base = items.map(() => '')
    saved?.answers?.forEach((a, i) => { if (i < base.length) base[i] = a })
    return base
  })
  const [index, setIndex] = useState(0)
  const [helpShown, setHelpShown] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const item = items[index]
  if (!item) return null

  const go = (next: number) => {
    setIndex(next)
    setHelpShown(false)
    setRevealed(false)
  }
  const save = (submitted: boolean) => {
    saveChallenge(storyId, 'comprehension', answers, submitted || (saved?.submitted ?? false))
    onExit()
  }

  return (
    <ChallengeFrame
      title="Comprehension"
      index={index}
      total={items.length}
      onExit={() => save(false)}
      onPrev={() => go(Math.max(0, index - 1))}
      onNext={() => go(index + 1)}
      onSubmit={() => save(true)}
    >
      <div className={cardClass}>
        <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
          Answer in a full Arabic sentence
        </p>
        <p className="font-arabic mt-3 text-right text-3xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
          {item.questionArabic}
        </p>
        <div className="mt-2 flex justify-end">
          {helpShown ? (
            <div className="text-right">
              <p className="text-xs italic text-teal-700 dark:text-teal-300">{item.questionTransliteration}</p>
              <p className="text-xs text-ink-600 dark:text-parchment-200/70">{item.questionEnglish}</p>
            </div>
          ) : (
            <button type="button" onClick={() => setHelpShown(true)} className={revealBtn}>
              Show help
            </button>
          )}
        </div>
        <textarea
          value={answers[index] ?? ''}
          onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === index ? e.target.value : a)))}
          dir="rtl"
          rows={2}
          placeholder="اكتب جوابك بجملة كاملة..."
          className={`${inputClass} mt-3`}
        />
        {!item.modelArabic ? (
          <p className="mt-3 text-xs text-ink-500 dark:text-parchment-200/50">
            ✍️ No model answer for this one — we'll go over it together in lesson.
          </p>
        ) : !revealed ? (
          <button type="button" onClick={() => setRevealed(true)} className={`${ghostBtn} mt-3`}>
            Reveal model answer
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-leaf-500/30 bg-leaf-100/60 p-4 text-right dark:bg-leaf-500/10">
            <p className="font-arabic text-2xl text-ink-900 dark:text-parchment-50" dir="rtl">
              {item.modelArabic}
            </p>
            {item.modelTransliteration && <p className="mt-1 text-xs italic text-teal-700 dark:text-teal-300">{item.modelTransliteration}</p>}
            <p className="mt-0.5 text-xs text-ink-600 dark:text-parchment-200/70">{item.modelEnglish}</p>
          </div>
        )}
      </div>
    </ChallengeFrame>
  )
}
