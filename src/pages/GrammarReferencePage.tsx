import { useState } from 'react'
import { grammarConcepts } from '../data/grammar'
import { GrammarCallout } from '../components/GrammarCallout'
import { WordFormsExplorer } from '../components/WordFormsExplorer'
import { useProgressStore } from '../store/progressStore'
import { scopedConceptIds } from '../lib/lessonScope'
import { getStoryById } from '../data/stories'

export function GrammarReferencePage() {
  const [showAll, setShowAll] = useState(false)
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const grammarDone = useProgressStore((s) => s.grammarDone)
  const markGrammarDone = useProgressStore((s) => s.markGrammarDone)
  const currentStory = getStoryById(currentStoryId)
  const inScope = scopedConceptIds(currentStoryId)

  const concepts = showAll ? grammarConcepts : grammarConcepts.filter((c) => inScope.has(c.id))

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
