import { useMemo, useState } from 'react'
import { words } from '../data/words'
import type { PartOfSpeech } from '../types'
import { ArabicText } from '../components/ArabicText'
import { useProgressStore } from '../store/progressStore'
import { isWordInScope } from '../lib/lessonScope'
import { getStoryById } from '../data/stories'

const POS_LABELS: Record<PartOfSpeech, string> = {
  noun: 'Noun',
  'proper-noun': 'Proper noun',
  adjective: 'Adjective',
  verb: 'Verb',
  pronoun: 'Pronoun',
  demonstrative: 'Demonstrative',
  preposition: 'Preposition',
  particle: 'Particle',
  'relative-pronoun': 'Relative pronoun',
}

/**
 * The vocab bank shows only DICTIONARY (base) forms — the past-tense "he"
 * form for verbs (عَبَدَ not يَعْبُدُ or عَبَدْتُ) and the bare singular for
 * nouns (بَيْت not بَيْتُكُمْ). Conjugations and inflected forms live in the
 * Grammar page's Word Forms Explorer instead.
 */
function isBaseForm(w: (typeof words)[number]): boolean {
  if (w.arabic.includes(' ')) return false // multi-word entries like لَنْ يَتْرُكَ
  if (/\b(my|your|his|her|our|their)\b/.test(w.meaning)) return false // suffixed nouns like دِينُكُمْ
  if (w.partOfSpeech === 'verb') {
    if (/^ي[َُ]/.test(w.arabic)) return false // present-tense twin — explorer covers it
    if (!/^(he|it) |^is /.test(w.meaning)) return false // conjugated persons like كَتَبْتُ "I wrote"
  }
  return true
}

const baseWords = words.filter(isBaseForm)

export function VocabBankPage() {
  const [tierFilter, setTierFilter] = useState<0 | 1 | 2 | 3>(0)
  const [posFilter, setPosFilter] = useState<PartOfSpeech | 'all'>('all')
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const currentStory = getStoryById(currentStoryId)

  const filtered = useMemo(() => {
    return baseWords.filter((w) => {
      if (!showAll && !isWordInScope(w, currentStoryId)) return false
      if (tierFilter !== 0 && w.frequencyTier !== tierFilter) return false
      if (posFilter !== 'all' && w.partOfSpeech !== posFilter) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (!w.meaning.toLowerCase().includes(q) && !w.transliteration.toLowerCase().includes(q) && !w.arabic.includes(q)) {
          return false
        }
      }
      return true
    })
  }, [tierFilter, posFilter, query, showAll, currentStoryId])

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Vocabulary bank</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        {showAll
          ? `All ${baseWords.length} words across every lesson, in dictionary form.`
          : `Words for lessons 1–${currentStory?.order ?? 1} (your current lesson), in dictionary form.`}{' '}
        For every conjugation and suffix of a word, see the Word Forms Explorer on the Grammar page.
      </p>
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="mt-2 rounded-full border border-teal-700/20 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-700/10 dark:border-teal-100/20 dark:text-teal-300"
      >
        {showAll ? '← Back to my lesson’s words' : 'Show all lessons’ words'}
      </button>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search meaning or word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-48 flex-1 rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-900/50"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
          className="rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none dark:border-teal-100/20 dark:bg-ink-900/50"
        >
          <option value={0}>All tiers</option>
          <option value={1}>Tier 1 — highest frequency</option>
          <option value={2}>Tier 2 — story vocabulary</option>
          <option value={3}>Tier 3 — conjugation forms</option>
        </select>
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value as PartOfSpeech | 'all')}
          className="rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none dark:border-teal-100/20 dark:bg-ink-900/50"
        >
          <option value="all">All parts of speech</option>
          {Object.entries(POS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((w) => (
          <div key={w.id} className="rounded-2xl border border-teal-700/10 bg-white/60 p-4 dark:border-teal-100/10 dark:bg-ink-900/40">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-700/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-300/10 dark:text-teal-300">
                {POS_LABELS[w.partOfSpeech]}
              </span>
              <span className="text-[11px] font-semibold text-gold-600 dark:text-gold-300">Tier {w.frequencyTier}</span>
            </div>
            <div className="mt-2">
              <ArabicText arabic={w.arabic} transliteration={w.transliteration} english={w.meaning} size="md" />
            </div>
            {w.root && (
              <p className="mt-2 text-right text-xs text-ink-500 dark:text-parchment-200/50" dir="rtl">
                جذر: {w.root}
              </p>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-ink-500 dark:text-parchment-200/50">No words match those filters.</p>}
      </div>
    </div>
  )
}
