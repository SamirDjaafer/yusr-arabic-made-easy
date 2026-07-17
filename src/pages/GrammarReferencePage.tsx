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
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="mt-2 rounded-full border border-teal-700/20 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-700/10 dark:border-teal-100/20 dark:text-teal-300"
      >
        {showAll ? '← Back to my lesson’s grammar' : 'Show all lessons’ grammar'}
      </button>

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
