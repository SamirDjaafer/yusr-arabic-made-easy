import { getGrammarConcept } from '../data/grammar'
import { ArabicText } from './ArabicText'

export function GrammarCallout({ grammarId }: { grammarId: string }) {
  const concept = getGrammarConcept(grammarId)
  if (!concept) return null

  return (
    <div className="rounded-2xl border border-gold-400/40 bg-gold-200/30 p-5 dark:border-gold-500/30 dark:bg-gold-700/10">
      <div className="flex items-center gap-2 text-gold-700 dark:text-gold-300">
        <span aria-hidden className="text-lg">💡</span>
        <p className="text-xs font-bold uppercase tracking-wide">Grammar note</p>
      </div>
      <h3 className="mt-1 text-lg font-semibold text-ink-900 dark:text-parchment-50">{concept.title}</h3>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-700 dark:text-parchment-200/90">
        {concept.explanation.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {concept.examples.map((ex, i) => (
          <div key={i} className="rounded-lg bg-parchment-50/70 p-3 dark:bg-ink-900/50">
            <ArabicText arabic={ex.arabic} transliteration={ex.transliteration} english={ex.gloss} size="md" />
          </div>
        ))}
      </div>

      {concept.paradigms && concept.paradigms.length > 0 && (
        <div className="mt-5 space-y-4">
          {concept.paradigms.map((paradigm, pi) => (
            <div key={pi} className="rounded-xl border border-teal-700/15 bg-parchment-50/60 p-3 dark:border-teal-100/15 dark:bg-ink-950/30">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">{paradigm.title}</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {paradigm.rows.map((row, ri) => (
                      <tr key={ri} className="border-t border-teal-700/10 first:border-t-0 dark:border-teal-100/10">
                        <td className="py-1.5 pr-3 text-xs text-ink-600 dark:text-parchment-200/70">{row.label}</td>
                        <td className="py-1.5 pr-3 text-right">
                          <span className="font-arabic text-xl text-ink-900 dark:text-parchment-50" dir="rtl">
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
          ))}
        </div>
      )}
    </div>
  )
}
