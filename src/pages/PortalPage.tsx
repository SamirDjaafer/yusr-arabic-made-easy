import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProgressStore, MASTERY_TARGET } from '../store/progressStore'
import { getStoryById } from '../data/stories'
import { scopedWords, scopedConceptIds } from '../lib/lessonScope'
import { comprehension } from '../data/comprehension'
import { useFlashcardStore } from '../store/flashcardStore'
import { getStoryDeck } from '../lib/storyDecks'

const DRILL_TYPES = ['change-one-word', 'true-false', 'vocab-translate']
const CHALLENGE_IDS = ['own-sentences', 'translate', 'comprehension']

export function PortalPage() {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const completedStoryIds = useProgressStore((s) => s.completedStoryIds)
  const drillMastery = useProgressStore((s) => s.drillMastery)
  const challenges = useProgressStore((s) => s.challenges)
  const mistakeQueue = useProgressStore((s) => s.mistakeQueue)
  const masteredCards = useFlashcardStore((s) => s.mastered)

  const story = getStoryById(currentStoryId)
  if (!story) return <Navigate to="/" replace />

  const completed = completedStoryIds.includes(story.id)
  const masteryCorrect = DRILL_TYPES.reduce(
    (sum, t) => sum + Math.min(MASTERY_TARGET, drillMastery[story.id]?.[t] ?? 0),
    0,
  )
  const masteryTotal = DRILL_TYPES.length * MASTERY_TARGET
  const submittedCount = CHALLENGE_IDS.filter((id) => challenges[story.id]?.[id]?.submitted).length
  const vocabCount = scopedWords(story.id).length
  const grammarCount = scopedConceptIds(story.id).size
  const comprehensionCount = comprehension[story.id]?.length ?? 0

  const sections = [
    {
      to: `/stories/${story.id}`,
      icon: '📖',
      title: 'Reading',
      status: completed ? '✓ Story completed — read again any time' : 'Read the story with tap-to-reveal meanings',
      accent: true,
    },
    {
      to: '/exercises',
      icon: '✏️',
      title: 'Exercises',
      status: `${masteryCorrect}/${masteryTotal} to full mastery — three drills from this story's sentences`,
    },
    {
      to: '/challenges',
      icon: '🏆',
      title: 'Challenges',
      status: `${submittedCount}/3 submitted — own sentences, translation & ${comprehensionCount} comprehension questions`,
    },
    {
      to: '/flashcards',
      icon: '🗂️',
      title: 'Memorise Vocab',
      status: (() => {
        const deck = getStoryDeck(story.id)
        const done = deck.filter((c) => masteredCards[c.id]).length
        return `${done}/${deck.length} cards mastered in this lesson's deck`
      })(),
    },
    {
      to: '/vocab',
      icon: '🔤',
      title: 'Vocab Bank',
      status: `${vocabCount} words unlocked up to this lesson`,
    },
    {
      to: '/grammar',
      icon: '📐',
      title: 'Grammar',
      status: `${grammarCount} rules unlocked, plus full word-form tables`,
    },
    {
      to: '/lab',
      icon: '🧪',
      title: 'Sentences',
      status: 'Rebuild this lesson\'s sentences, or write and check your own',
    },
    {
      to: '/review',
      icon: '🛠️',
      title: 'Review Mistakes',
      status: mistakeQueue.length > 0 ? `${mistakeQueue.length} item(s) waiting for you` : 'Nothing queued right now',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-ink-900/10 bg-gradient-to-br from-ink-900 to-ink-800 p-8 text-center">
        <p className="font-arabic text-4xl leading-relaxed text-gold-400" dir="rtl">
          {story.titleArabic}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-parchment-50">
          Lesson {story.order}: {story.title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-parchment-100/80">{story.description}</p>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-gold-400 underline decoration-gold-500/40 underline-offset-2">
          Change lesson
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {sections.map((s, i) => (
          <motion.div key={s.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link
              to={s.to}
              className={`flex h-full items-start gap-3 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                s.accent
                  ? 'border-gold-500/50 bg-gold-200/20 hover:border-gold-500'
                  : 'border-ink-900/10 bg-white hover:border-gold-500/50'
              }`}
            >
              <span className="text-2xl" aria-hidden>
                {s.icon}
              </span>
              <span>
                <span className="block text-lg font-semibold text-ink-900">{s.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-600">{s.status}</span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
