import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getGrammarConcept } from '../data/grammar'

interface CorrectionFeedbackProps {
  correct: boolean
  correctAnswerLabel?: string
  explanation: string
  relatedGrammarId?: string
}

export function CorrectionFeedback({ correct, correctAnswerLabel, explanation, relatedGrammarId }: CorrectionFeedbackProps) {
  const concept = relatedGrammarId ? getGrammarConcept(relatedGrammarId) : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border p-4 ${
        correct
          ? 'border-leaf-500/40 bg-leaf-100 dark:border-leaf-500/30 dark:bg-leaf-500/10'
          : 'border-rose-500/40 bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10'
      }`}
    >
      <div className="flex items-center gap-2 font-semibold text-ink-900 dark:text-parchment-50">
        <span aria-hidden>{correct ? '✅' : '✏️'}</span>
        <span>{correct ? 'Correct!' : 'Not quite — here\'s the correction'}</span>
      </div>

      {!correct && correctAnswerLabel && (
        <p className="mt-2 text-sm text-ink-800 dark:text-parchment-100">
          Correct answer: <span className="font-semibold">{correctAnswerLabel}</span>
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-parchment-200/90">{explanation}</p>

      {!correct && concept && (
        <p className="mt-3 text-sm">
          <Link to="/grammar" className="font-medium text-teal-700 underline decoration-teal-400/60 underline-offset-2 dark:text-teal-300">
            Review: {concept.title} →
          </Link>
        </p>
      )}
    </motion.div>
  )
}
