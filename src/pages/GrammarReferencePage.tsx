import { useState } from 'react'
import { grammarConcepts } from '../data/grammar'
import { GrammarCallout } from '../components/GrammarCallout'
import { WordFormsExplorer } from '../components/WordFormsExplorer'
import { useProgressStore } from '../store/progressStore'
import { scopedConceptIds } from '../lib/lessonScope'
import { getStoryById } from '../data/stories'
import { principlesForLesson } from '../data/original/adapter'

export function GrammarReferencePage() {
  const [showAll, setShowAll] = useState(false)
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const grammarDone = useProgressStore((s) => s.grammarDone)
  const markGrammarDone = useProgressStore((s) => s.markGrammarDone)
  const currentStory = getStoryById(currentStoryId)
  const inScope = scopedConceptIds(currentStoryId)

  const concepts = showAll ? grammarConcepts : grammarConcepts.filter((c) => inScope.has(c.id))
  const principles = principlesForLesson(currentStory?.order ?? 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Grammar reference</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        {showAll
          ? 'Every rule across all lessons.'
          : `The rules taught up to lesson ${currentStory?.order ?? 1} (your current lesson).`}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="rounded-full border border-teal-700/20 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-700/10 dark:border-teal-100/20 dark:text-teal-300"
        >
          {showAll ? '← Back to my lesson’s grammar' : 'Show all lessons’ grammar'}
        </button>
        {grammarDone[currentStoryId] ? (
          <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-500 dark:bg-leaf-500/10">
            ✓ Grammar done for this lesson
          </span>
        ) : (
          <button
            type="button"
            onClick={() => markGrammarDone(currentStoryId)}
            className="rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-ink-950 hover:bg-gold-400"
          >
            Mark grammar as done ✓
          </button>
        )}
      </div>

      {principles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gold-200/30 p-5 dark:border-gold-500/30 dark:bg-gold-700/10">
          <div className="flex items-center gap-2 text-gold-700 dark:text-gold-300">
            <span aria-hidden className="text-lg">🗝️</span>
            <p className="text-xs font-bold uppercase tracking-wide">Key principles — lesson {currentStory?.order}</p>
          </div>
          <div className="mt-3 space-y-2">
            {principles.map((pr, i) => (
              <details key={i} className="rounded-xl bg-parchment-50/70 p-3 dark:bg-ink-900/50">
                <summary
                  className="cursor-pointer text-sm font-semibold text-ink-900 dark:text-parchment-50"
                  dangerouslySetInnerHTML={{ __html: pr.q }}
                />
                <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-parchment-200/90" dangerouslySetInnerHTML={{ __html: pr.a }} />
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <WordFormsExplorer />
      </div>

      <div className="mt-6 space-y-5">
        {concepts.map((concept) => (
          <div key={concept.id} id={concept.id}>
            <GrammarCallout grammarId={concept.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
