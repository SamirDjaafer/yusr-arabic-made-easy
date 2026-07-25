import { useMemo, useState } from 'react'
import type { ParadigmRow } from '../types'
import {
  CATEGORY_LABELS,
  PERSON_ORDER,
  getEligibleWords,
  getTable,
  getVerbPairs,
  type ExplorerCategory,
} from '../lib/conjugator'
import { useProgressStore } from '../store/progressStore'
import { isWordInScope, scopedRoots } from '../lib/lessonScope'

function VerbCell({ row }: { row: ParadigmRow | undefined }) {
  return (
    <td className="py-2 pr-3 text-right align-top">
      {row ? (
        <>
          <span className="font-arabic block text-2xl text-ink-900 dark:text-parchment-50" dir="rtl">
            {row.arabic}
          </span>
          <span className="block text-xs italic text-teal-700 dark:text-teal-300">{row.transliteration}</span>
          <span className="block text-[11px] text-ink-600 dark:text-parchment-200/70">{row.gloss}</span>
        </>
      ) : (
        <span className="text-xs text-ink-400 dark:text-parchment-200/40">—</span>
      )}
    </td>
  )
}

type ExplorerView = 'verbs-both' | ExplorerCategory

const VIEW_LABELS: Record<ExplorerView, string> = {
  'verbs-both': 'Verbs — past & present together',
  ...CATEGORY_LABELS,
}
const VIEWS = Object.keys(VIEW_LABELS) as ExplorerView[]

/** diacritic-insensitive, case-insensitive substring match (typed Arabic, transliteration, or English all work) */
function normalizeSearch(s: string): string {
  return s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim()
}

export function WordFormsExplorer() {
  const [view, setView] = useState<ExplorerView>('verbs-both')
  const [allLessons, setAllLessons] = useState(false)
  const [search, setSearch] = useState('')
  const currentStoryId = useProgressStore((s) => s.currentStoryId)

  const verbPairs = useMemo(() => {
    const pairs = getVerbPairs()
    if (allLessons) return pairs
    const roots = scopedRoots(currentStoryId)
    return pairs.filter((p) => roots.has(p.id))
  }, [allLessons, currentStoryId])

  const eligibleWords = useMemo(() => {
    if (view === 'verbs-both') return []
    const all = getEligibleWords(view)
    if (allLessons) return all
    return all.filter((w) => isWordInScope(w, currentStoryId))
  }, [view, allLessons, currentStoryId])

  const searchNeedle = normalizeSearch(search)
  const filteredPairs = useMemo(() => {
    if (!searchNeedle) return verbPairs
    return verbPairs.filter((p) => normalizeSearch(p.arabicLabel).includes(searchNeedle) || normalizeSearch(p.meaning).includes(searchNeedle))
  }, [verbPairs, searchNeedle])
  const filteredWords = useMemo(() => {
    if (!searchNeedle) return eligibleWords
    return eligibleWords.filter(
      (w) =>
        normalizeSearch(w.arabic).includes(searchNeedle) ||
        normalizeSearch(w.transliteration).includes(searchNeedle) ||
        normalizeSearch(w.meaning).includes(searchNeedle)
    )
  }, [eligibleWords, searchNeedle])

  const [selectionId, setSelectionId] = useState<string>(() => verbPairs[0]?.id ?? '')

  const changeView = (next: ExplorerView) => {
    setView(next)
    setSelectionId('')
  }

  const selectedPair = view === 'verbs-both' ? (filteredPairs.find((p) => p.id === selectionId) ?? filteredPairs[0]) : null
  const selectedWord = view !== 'verbs-both' ? (filteredWords.find((w) => w.id === selectionId) ?? filteredWords[0]) : null
  const table = view !== 'verbs-both' && selectedWord ? getTable(view, selectedWord) : null

  return (
    <div className="rounded-2xl border border-teal-700/15 bg-white/70 p-5 dark:border-teal-100/15 dark:bg-ink-900/50">
      <h2 className="text-lg font-bold text-ink-900 dark:text-parchment-50">Word forms explorer</h2>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        Pick a category and a word to see its complete table — every person for verbs, every suffix and case for
        nouns. Irregular (hollow/weak) words appear only where a verified table exists.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={view}
          onChange={(e) => changeView(e.target.value as ExplorerView)}
          className="max-w-full rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none dark:border-teal-100/20 dark:bg-ink-900/50"
        >
          {VIEWS.map((v) => (
            <option key={v} value={v}>
              {VIEW_LABELS[v]}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a word (Arabic, transliteration, or English)…"
          className="min-w-52 flex-1 rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none focus:border-teal-500 dark:border-teal-100/20 dark:bg-ink-900/50"
        />

        {view === 'verbs-both' ? (
          <select
            value={selectedPair?.id ?? ''}
            onChange={(e) => setSelectionId(e.target.value)}
            className="max-w-full rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none dark:border-teal-100/20 dark:bg-ink-900/50"
          >
            {filteredPairs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.arabicLabel} — {p.meaning}
              </option>
            ))}
          </select>
        ) : null}
        {view === 'verbs-both' ? null : (
          <select
            value={selectedWord?.id ?? ''}
            onChange={(e) => setSelectionId(e.target.value)}
            className="max-w-full rounded-full border border-teal-700/20 bg-white/70 px-4 py-2 text-sm outline-none dark:border-teal-100/20 dark:bg-ink-900/50"
          >
            {filteredWords.map((w) => (
              <option key={w.id} value={w.id}>
                {w.arabic} — {w.meaning}
              </option>
            ))}
          </select>
        )}

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-600 dark:text-parchment-200/70">
          <input type="checkbox" checked={allLessons} onChange={(e) => setAllLessons(e.target.checked)} />
          all lessons
        </label>
      </div>

      {view === 'verbs-both' && search && filteredPairs.length === 0 && (
        <p className="mt-3 text-sm text-ink-500 dark:text-parchment-200/50">No verbs match "{search}".</p>
      )}
      {view !== 'verbs-both' && search && filteredWords.length === 0 && (
        <p className="mt-3 text-sm text-ink-500 dark:text-parchment-200/50">No words match "{search}".</p>
      )}

      {view === 'verbs-both' && selectedPair && (
        <div className="mt-4 rounded-xl border border-teal-700/15 bg-parchment-50/60 p-3 dark:border-teal-100/15 dark:bg-ink-950/30">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            {selectedPair.arabicLabel} — {selectedPair.meaning}: every person
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-600 dark:text-parchment-200/70">
                  <th className="py-1.5 pr-3 font-semibold">person</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Past (الماضي)</th>
                  <th className="py-1.5 pr-3 text-right font-semibold">Present (المضارع)</th>
                  {selectedPair.imperative && <th className="py-1.5 text-right font-semibold">Command (الأمر)</th>}
                </tr>
              </thead>
              <tbody>
                {PERSON_ORDER.map((person) => {
                  const pastRow = selectedPair.past?.rows.find((r) => r.label === person)
                  const presentRow = selectedPair.present?.rows.find((r) => r.label === person)
                  const impRow = selectedPair.imperative?.rows.find((r) => r.label === person)
                  if (!pastRow && !presentRow && !impRow) return null
                  return (
                    <tr key={person} className="border-t border-teal-700/10 dark:border-teal-100/10">
                      <td className="py-2 pr-3 align-top text-xs text-ink-600 dark:text-parchment-200/70">{person}</td>
                      <VerbCell row={pastRow} />
                      <VerbCell row={presentRow} />
                      {selectedPair.imperative && <VerbCell row={impRow} />}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-500 dark:text-parchment-200/50">
            Past (الماضي) = a completed action: عَبَدْتُ "I worshipped". Present (المضارع) covers now, habitually, AND
            the future: أَعْبُدُ can mean "I worship", "I am worshipping", or "I will worship" — context decides.
            Command (الأمر) is an instruction and only exists for "you": اُعْبُدْ "Worship!". A "—" means that form
            isn't covered yet (irregular without a verified table, or not in the vocabulary).
          </p>
        </div>
      )}

      {view !== 'verbs-both' && table && (
        <div className="mt-4 rounded-xl border border-teal-700/15 bg-parchment-50/60 p-3 dark:border-teal-100/15 dark:bg-ink-950/30">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">{table.title}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="border-t border-teal-700/10 first:border-t-0 dark:border-teal-100/10">
                    <td className="py-1.5 pr-3 text-xs text-ink-600 dark:text-parchment-200/70">{row.label}</td>
                    <td className="py-1.5 pr-3 text-right">
                      <span className="font-arabic text-2xl text-ink-900 dark:text-parchment-50" dir="rtl">
                        {row.arabic}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3 text-right text-xs italic text-teal-700 dark:text-teal-300">{row.transliteration}</td>
                    <td className="py-1.5 text-xs text-ink-600 dark:text-parchment-200/70">{row.gloss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
