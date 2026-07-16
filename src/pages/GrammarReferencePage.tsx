import { grammarConcepts } from '../data/grammar'
import { GrammarCallout } from '../components/GrammarCallout'
import { WordFormsExplorer } from '../components/WordFormsExplorer'

export function GrammarReferencePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">Grammar reference</h1>
      <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/80">
        Every rule taught across the stories, in one place to revisit any time.
      </p>

      <div className="mt-6">
        <WordFormsExplorer />
      </div>

      <div className="mt-6 space-y-5">
        {grammarConcepts.map((concept) => (
          <div key={concept.id} id={concept.id}>
            <GrammarCallout grammarId={concept.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
