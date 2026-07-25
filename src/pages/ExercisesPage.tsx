import { useState } from 'react'
import { useProgressStore, MASTERY_TARGET } from '../store/progressStore'
import { getStoryById } from '../data/stories'
import {
  arabicAnswersMatch,
  makeChangeOneWord,
  makeSentenceTranslate,
  makeTrueFalse,
  makeVocabTranslate,
  type SentenceTranslateQuestion,
  type TrueFalseQuestion,
  type VocabTranslateQuestion,
  type WordDrillQuestion,
} from '../lib/drills'

const SESSION_LENGTH = 10

type DrillType = 'change-one-word' | 'true-false' | 'vocab-translate' | 'sentence-translate'

const DRILLS: { type: DrillType; icon: string; title: string; blurb: string }[] = [
  { type: 'change-one-word', icon: '✏️', title: 'Change One Word', blurb: 'A sentence has one wrong word. Type the correct replacement.' },
  { type: 'true-false', icon: '✅', title: 'True or False', blurb: 'Is the sentence correct, or does it contain an error?' },
  { type: 'vocab-translate', icon: '📖', title: 'Vocab — Translate', blurb: 'Read the English word, write the Arabic with harakat, then reveal and grade yourself.' },
  { type: 'sentence-translate', icon: '✍️', title: 'Sentence — Translate', blurb: 'Read an English sentence, write the whole thing in Arabic, then reveal and grade yourself.' },
]

export function ExercisesPage() {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const drillMastery = useProgressStore((s) => s.drillMastery)
  const story = getStoryById(currentStoryId)
  const [active, setActive] = useState<DrillType | null>(null)

  if (active) {
    return <DrillSession storyId={currentStoryId} type={active} onExit={() => setActive(null)} />
  }

  const masteryFor = (type: DrillType) => drillMastery[currentStoryId]?.[type] ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Lesson {story?.order} exercises</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        Drills built from the sentences and words of "{story?.title}". Answer {MASTERY_TARGET} correctly in a drill to
        master it for this lesson.
      </p>

      <div className="mt-6 space-y-3">
        {DRILLS.map((d) => {
          const correct = masteryFor(d.type)
          const remaining = Math.max(0, MASTERY_TARGET - correct)
          const mastered = remaining === 0
          return (
            <button
              key={d.type}
              type="button"
              onClick={() => setActive(d.type)}
              className="block w-full rounded-2xl border border-teal-700/15 bg-white/60 p-5 text-left transition-colors hover:border-gold-500/50 dark:border-teal-100/15 dark:bg-ink-900/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${mastered ? 'text-leaf-500' : 'text-gold-600 dark:text-gold-300'}`}>
                    {mastered ? '✓ Mastered' : `${remaining} until mastery`}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-ink-900 dark:text-parchment-50">{d.title}</h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">{d.blurb}</p>
                </div>
                <span className="text-2xl" aria-hidden>
                  {d.icon}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-teal-700/10 dark:bg-teal-300/10">
                <div
                  className={`h-full rounded-full ${mastered ? 'bg-leaf-500' : 'bg-gold-500'}`}
                  style={{ width: `${Math.min(100, (correct / MASTERY_TARGET) * 100)}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- session runner ---------------------------------------------------------

function DrillSession({ storyId, type, onExit }: { storyId: string; type: DrillType; onExit: () => void }) {
  const recordDrillResult = useProgressStore((s) => s.recordDrillResult)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState(() => makeQuestion(storyId, type))
  const [done, setDone] = useState(false)

  const next = () => {
    if (questionNumber >= SESSION_LENGTH) {
      setDone(true)
    } else {
      setQuestionNumber((n) => n + 1)
      setQuestion(makeQuestion(storyId, type))
    }
  }

  const handleResult = (correct: boolean) => {
    recordDrillResult(storyId, type, correct)
    if (correct) setScore((s) => s + 1)
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-leaf-500/40 bg-leaf-100 p-8 text-center dark:border-leaf-500/30 dark:bg-leaf-500/10">
        <p className="text-3xl">🎯</p>
        <h1 className="mt-2 text-xl font-bold text-ink-900 dark:text-parchment-50">
          Session complete — {score}/{SESSION_LENGTH}
        </h1>
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-teal-700/30 px-5 py-2 text-sm font-semibold text-teal-700 dark:border-teal-300/30 dark:text-teal-300"
          >
            Back to exercises
          </button>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="rounded-2xl border border-teal-700/15 bg-white/60 p-8 text-center dark:border-teal-100/15 dark:bg-ink-900/40">
        <p className="text-sm text-ink-600 dark:text-parchment-200/80">Couldn't build a question for this story — try another drill.</p>
        <button type="button" onClick={onExit} className="mt-3 text-sm font-semibold text-teal-700 dark:text-teal-300">
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onExit} className="text-sm font-semibold text-teal-700 dark:text-teal-300">
          ← Save & exit
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-parchment-200/70">
          Question {questionNumber} of {SESSION_LENGTH} · {score} correct
        </p>
      </div>

      {question.kind === 'change-one-word' && (
        <ChangeOneWordCard key={questionNumber} q={question} onResult={handleResult} onNext={next} />
      )}
      {question.kind === 'true-false' && <TrueFalseCard key={questionNumber} q={question} onResult={handleResult} onNext={next} />}
      {question.kind === 'vocab-translate' && (
        <VocabTranslateCard key={questionNumber} q={question} onResult={handleResult} onNext={next} />
      )}
      {question.kind === 'sentence-translate' && (
        <SentenceTranslateCard key={questionNumber} q={question} onResult={handleResult} onNext={next} />
      )}
    </div>
  )
}

function makeQuestion(storyId: string, type: DrillType) {
  if (type === 'change-one-word') return makeChangeOneWord(storyId)
  if (type === 'true-false') return makeTrueFalse(storyId)
  if (type === 'vocab-translate') return makeVocabTranslate(storyId)
  return makeSentenceTranslate(storyId)
}

const cardClass = 'rounded-2xl border border-teal-700/15 bg-white/60 p-6 dark:border-teal-100/15 dark:bg-ink-900/40'
const buttonClass =
  'rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 disabled:opacity-40 dark:bg-teal-500 dark:text-ink-950'

function ChangeOneWordCard({ q, onResult, onNext }: { q: WordDrillQuestion; onResult: (c: boolean) => void; onNext: () => void }) {
  const [typed, setTyped] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)

  const check = () => {
    const correct = arabicAnswersMatch(typed, q.correctToken)
    setResult(correct)
    onResult(correct)
  }

  return (
    <div className={cardClass}>
      <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
        One word is wrong — type the correct word
      </p>
      <p className="font-arabic mt-3 text-right text-3xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
        {q.displaySentence.split(' ').map((token, i) => (
          <span key={i} className={showHint && i === q.corruptedIndex ? 'rounded bg-rose-100 px-1 text-rose-500 dark:bg-rose-500/15' : ''}>
            {token}{' '}
          </span>
        ))}
      </p>
      <p className="mt-1 text-right text-xs text-ink-500 dark:text-parchment-200/50">Meaning of the original: {q.english}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          dir="rtl"
          placeholder="اكتب الكلمة الصحيحة"
          disabled={result !== null}
          className="font-arabic min-w-52 flex-1 rounded-xl border border-teal-700/20 bg-parchment-50/70 px-3 py-2 text-xl outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40"
        />
        {result === null ? (
          <>
            <button type="button" onClick={check} disabled={!typed.trim()} className={buttonClass}>
              Check
            </button>
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="rounded-full border border-teal-700/20 px-4 py-2 text-sm text-teal-700 dark:border-teal-100/20 dark:text-teal-300"
            >
              📍 Hint
            </button>
          </>
        ) : (
          <button type="button" onClick={onNext} className={buttonClass}>
            Next →
          </button>
        )}
      </div>

      {result !== null && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            result
              ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
              : 'border-rose-500/40 bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10'
          }`}
        >
          <p className="font-semibold text-ink-900 dark:text-parchment-50">{result ? '✅ Correct!' : 'Not quite.'}</p>
          <p className="mt-1 text-ink-700 dark:text-parchment-200/90">
            The wrong word was <span className="font-arabic text-lg">{q.displaySentence.split(' ')[q.corruptedIndex]}</span> — the story says{' '}
            <span className="font-arabic text-lg text-leaf-500">{q.correctToken}</span>.
          </p>
        </div>
      )}
    </div>
  )
}

function TrueFalseCard({ q, onResult, onNext }: { q: TrueFalseQuestion; onResult: (c: boolean) => void; onNext: () => void }) {
  const [answered, setAnswered] = useState<boolean | null>(null)

  const answer = (saidTrue: boolean) => {
    setAnswered(saidTrue)
    onResult(saidTrue === q.isTrue)
  }

  return (
    <div className={cardClass}>
      <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">Is this sentence correct?</p>
      <p className="font-arabic mt-3 text-right text-3xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
        {q.displaySentence}
      </p>

      {answered === null ? (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => answer(true)} className={buttonClass}>
            True
          </button>
          <button type="button" onClick={() => answer(false)} className={buttonClass}>
            False
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div
            className={`rounded-xl border p-4 text-sm ${
              answered === q.isTrue
                ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
                : 'border-rose-500/40 bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10'
            }`}
          >
            <p className="font-semibold text-ink-900 dark:text-parchment-50">
              {answered === q.isTrue ? '✅ Correct — ' : '❌ Not quite — '}the sentence is {q.isTrue ? 'True' : 'False'}.
            </p>
            <p className="mt-1 text-ink-700 dark:text-parchment-200/90">{q.note}</p>
            {!q.isTrue && (
              <p className="font-arabic mt-2 text-right text-xl text-leaf-500" dir="rtl">
                {q.originalSentence}
              </p>
            )}
          </div>
          <button type="button" onClick={onNext} className={`${buttonClass} mt-3`}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function VocabTranslateCard({ q, onResult, onNext }: { q: VocabTranslateQuestion; onResult: (c: boolean) => void; onNext: () => void }) {
  const [typed, setTyped] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [graded, setGraded] = useState(false)

  const grade = (gotIt: boolean) => {
    setGraded(true)
    onResult(gotIt)
  }

  return (
    <div className={cardClass}>
      <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
        Read the English, write the Arabic, then reveal
      </p>
      <p className="mt-3 text-3xl font-semibold text-ink-900 dark:text-parchment-50">{q.english}</p>

      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        dir="rtl"
        placeholder="اكتب الكلمة بالحركات"
        disabled={revealed}
        className="font-arabic mt-4 w-full rounded-xl border border-teal-700/20 bg-parchment-50/70 px-3 py-2 text-2xl outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40"
      />

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className={`${buttonClass} mt-4`}>
          Reveal →
        </button>
      ) : (
        <div className="mt-4">
          <div className="rounded-xl border border-teal-700/15 bg-parchment-50/60 p-4 text-right dark:border-teal-100/15 dark:bg-ink-950/30">
            <p className="font-arabic text-3xl text-ink-900 dark:text-parchment-50" dir="rtl">
              {q.arabic}
            </p>
            <p className="mt-1 text-sm italic text-teal-700 dark:text-teal-300">{q.transliteration}</p>
          </div>
          {!graded ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => grade(false)} className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white">
                No idea
              </button>
              <button type="button" onClick={() => grade(false)} className="rounded-xl bg-gold-500 px-3 py-2 text-sm font-semibold text-ink-950">
                Nearly got it
              </button>
              <button type="button" onClick={() => grade(true)} className="rounded-xl bg-leaf-500 px-3 py-2 text-sm font-semibold text-white">
                Got it right!
              </button>
            </div>
          ) : (
            <button type="button" onClick={onNext} className={`${buttonClass} mt-3`}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SentenceTranslateCard({ q, onResult, onNext }: { q: SentenceTranslateQuestion; onResult: (c: boolean) => void; onNext: () => void }) {
  const [typed, setTyped] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [graded, setGraded] = useState(false)

  const grade = (gotIt: boolean) => {
    setGraded(true)
    onResult(gotIt)
  }

  return (
    <div className={cardClass}>
      <p className="text-xs font-bold uppercase tracking-wide text-gold-600 dark:text-gold-300">
        Read the English sentence, write it in Arabic, then reveal
      </p>
      <p className="mt-3 text-xl font-semibold text-ink-900 dark:text-parchment-50">{q.english}</p>

      <textarea
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        dir="rtl"
        rows={2}
        placeholder="اكتب الجملة بالحركات"
        disabled={revealed}
        className="font-arabic mt-4 w-full resize-none rounded-xl border border-teal-700/20 bg-parchment-50/70 px-3 py-2 text-2xl leading-loose outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40"
      />

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className={`${buttonClass} mt-4`}>
          Reveal →
        </button>
      ) : (
        <div className="mt-4">
          <div className="rounded-xl border border-teal-700/15 bg-parchment-50/60 p-4 text-right dark:border-teal-100/15 dark:bg-ink-950/30">
            <p className="font-arabic text-2xl leading-loose text-ink-900 dark:text-parchment-50" dir="rtl">
              {q.arabic}
            </p>
          </div>
          {!graded ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => grade(false)} className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white">
                No idea
              </button>
              <button type="button" onClick={() => grade(false)} className="rounded-xl bg-gold-500 px-3 py-2 text-sm font-semibold text-ink-950">
                Nearly got it
              </button>
              <button type="button" onClick={() => grade(true)} className="rounded-xl bg-leaf-500 px-3 py-2 text-sm font-semibold text-white">
                Got it right!
              </button>
            </div>
          ) : (
            <button type="button" onClick={onNext} className={`${buttonClass} mt-3`}>
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
