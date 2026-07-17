import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { words } from '../data/words'
import { grammarConcepts } from '../data/grammar'
import { checkSentence, type CheckResult } from '../lib/sentenceChecker'
import { SentenceBuilder } from '../components/SentenceBuilder'
import { useProgressStore } from '../store/progressStore'
import { isWordInScope, scopedConceptIds } from '../lib/lessonScope'

export function SentenceLabPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [referenceOpen, setReferenceOpen] = useState(false)

  const currentStoryId = useProgressStore((st) => st.currentStoryId)

  const wordsByPos = useMemo(() => {
    const groups = new Map<string, typeof words>()
    for (const w of words) {
      if (!isWordInScope(w, currentStoryId)) continue
      const list = groups.get(w.partOfSpeech) ?? []
      list.push(w)
      groups.set(w.partOfSpeech, list)
    }
    return groups
  }, [currentStoryId])

  const handleCheck = () => {
    setResult(checkSentence(input))
  }

  const appendWord = (arabic: string) => {
    setInput((prev) => {
      const trimmed = prev.replace(/\s+$/, '')
      return trimmed.length === 0 ? arabic : `${trimmed} ${arabic}`
    })
    setResult(null)
  }

  const removeLastWord = () => {
    setInput((prev) => {
      const parts = prev.trim().split(/\s+/).filter(Boolean)
      parts.pop()
      return parts.join(' ')
    })
    setResult(null)
  }

  const clearInput = () => {
    setInput('')
    setResult(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Sentence Lab</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600 dark:text-parchment-200/80">
        Reconstruct a ready-made sentence by tapping its words in the right order, or scroll down to write something
        fully your own.
      </p>

      <section className="mt-6 rounded-2xl border border-teal-700/10 bg-white/60 p-5 dark:border-teal-100/10 dark:bg-ink-900/40">
        <SentenceBuilder key={currentStoryId} />
      </section>

      <section className="mt-6 rounded-2xl border border-teal-700/10 bg-white/60 p-5 dark:border-teal-100/10 dark:bg-ink-900/40">
        <label htmlFor="sentence-input" className="mb-2 block text-sm font-semibold text-ink-900 dark:text-parchment-50">
          Or write your own sentence
        </label>
        <textarea
          id="sentence-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          dir="rtl"
          rows={3}
          placeholder="اكتب جملتك هنا..."
          className="font-arabic w-full rounded-xl border border-teal-700/20 bg-parchment-50/70 p-3 text-2xl leading-loose outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-950/40"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!input.trim()}
            className="rounded-full bg-teal-700 px-6 py-2.5 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
          >
            Check my sentence
          </button>
          <button
            type="button"
            onClick={removeLastWord}
            disabled={!input.trim()}
            className="rounded-full border border-teal-700/20 px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-700/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-teal-100/20 dark:text-teal-300"
          >
            ← Remove last word
          </button>
          <button
            type="button"
            onClick={clearInput}
            disabled={!input.trim()}
            className="rounded-full border border-teal-700/20 px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-700/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-teal-100/20 dark:text-teal-300"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-500 dark:text-parchment-200/50">
          Checked entirely on your device — it recognizes words by their prefixes/suffixes and checks one rule with
          confidence (noun–adjective definiteness agreement). Not a full parser, so treat it as a first pass.
        </p>

        {result && result.verdict !== 'empty' && (
          <div className="mt-5 space-y-4">
            <div
              className={`rounded-xl border p-4 ${
                result.verdict === 'looks-consistent'
                  ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
                  : 'border-gold-500/40 bg-gold-200/40 dark:border-gold-500/30 dark:bg-gold-700/10'
              }`}
            >
              <p className="font-semibold text-ink-900 dark:text-parchment-50">
                {result.verdict === 'looks-consistent'
                  ? '✅ No issues found by the rules this checker knows.'
                  : '📝 A few things worth a second look:'}
              </p>
              {result.issues.length > 0 && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-700 dark:text-parchment-200/90">
                  {result.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-parchment-200/60">
                Word-by-word
              </p>
              <div className="flex flex-wrap justify-end gap-2" dir="rtl">
                {result.tokens.map((t, i) => (
                  <span
                    key={i}
                    title={t.matchedWord ? `${t.matchedWord.transliteration} — ${t.matchedWord.meaning}${t.note ? ` (${t.note})` : ''}` : 'not recognized'}
                    className={`font-arabic rounded-lg border px-3 py-1.5 text-xl ${
                      t.recognized
                        ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
                        : 'border-rose-500/40 bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10'
                    }`}
                  >
                    {t.raw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-teal-700/10 bg-white/60 dark:border-teal-100/10 dark:bg-ink-900/40">
        <button
          type="button"
          onClick={() => setReferenceOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="font-semibold text-ink-900 dark:text-parchment-50">
            Need a word? Browse the full word bank & grammar toolkit
          </span>
          <span className="text-teal-700 dark:text-teal-300">{referenceOpen ? '−' : '+'}</span>
        </button>
        {referenceOpen && (
          <div className="border-t border-teal-700/10 p-5 dark:border-teal-100/10">
            <p className="mb-3 text-xs text-ink-500 dark:text-parchment-200/50">
              Tap any tile to insert it into the "write your own" box above. Full list also on the{' '}
              <Link to="/vocab" className="text-teal-700 underline dark:text-teal-300">
                Vocab page
              </Link>
              .
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {grammarConcepts.filter((c) => scopedConceptIds(currentStoryId).has(c.id)).map((c) => (
                <div key={c.id} className="rounded-xl bg-parchment-50/70 p-3 dark:bg-ink-950/40">
                  <p className="text-sm font-semibold text-ink-900 dark:text-parchment-50">{c.title}</p>
                  <div className="mt-2 flex flex-wrap justify-end gap-2" dir="rtl">
                    {c.examples.slice(0, 3).map((ex, i) => (
                      <button
                        key={`ex-${i}`}
                        type="button"
                        title={`Tap to insert — ${ex.gloss}`}
                        onClick={() => appendWord(ex.arabic)}
                        className="font-arabic rounded-lg bg-teal-700/10 px-2 py-1 text-base transition-colors hover:bg-teal-700/20 dark:bg-teal-300/10 dark:hover:bg-teal-300/20"
                      >
                        {ex.arabic}
                      </button>
                    ))}
                    {c.paradigms?.flatMap((paradigm, pi) =>
                      paradigm.rows.map((row, ri) => (
                        <button
                          key={`pd-${pi}-${ri}`}
                          type="button"
                          title={`Tap to insert — ${row.gloss} (${row.label})`}
                          onClick={() => appendWord(row.arabic)}
                          className="font-arabic rounded-lg bg-gold-200/50 px-2 py-1 text-base transition-colors hover:bg-gold-200/80 dark:bg-gold-700/15 dark:hover:bg-gold-700/25"
                        >
                          {row.arabic}
                        </button>
                      )),
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="mb-2 mt-5 text-sm font-semibold text-ink-900 dark:text-parchment-50">Word bank ({words.length} words)</p>
            <div className="max-h-56 overflow-y-auto scroll-thin">
              <div className="flex flex-wrap justify-end gap-2" dir="rtl">
                {[...wordsByPos.entries()].flatMap(([, list]) =>
                  list.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      title={`Tap to insert — ${w.meaning}`}
                      onClick={() => appendWord(w.arabic)}
                      className="font-arabic rounded-md border border-teal-700/10 bg-parchment-50/60 px-2.5 py-1 text-base transition-colors hover:border-teal-500/40 hover:bg-teal-700/10 dark:border-teal-100/10 dark:bg-ink-950/30 dark:hover:bg-teal-300/10"
                    >
                      {w.arabic}
                    </button>
                  )),
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
