import { Link } from 'react-router-dom'
import { stories, isStoryUnlocked } from '../data/stories'
import { useProgressStore } from '../store/progressStore'
import { useFlashcardStore } from '../store/flashcardStore'
import { words } from '../data/words'

export function HomePage() {
  const { completedStoryIds, streak, mistakeQueue } = useProgressStore()
  const cards = useFlashcardStore((s) => s.cards)

  const nextStory = stories.find((s) => !completedStoryIds.includes(s.id) && isStoryUnlocked(s, completedStoryIds))
  const wordsSeen = new Set(
    stories.filter((s) => completedStoryIds.includes(s.id)).flatMap((s) => s.newWordIds),
  ).size
  const wordsInProgress = Object.keys(cards).length
  const wordsMastered = Object.values(cards).filter((c) => c.box >= 4).length

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-teal-700/10 bg-gradient-to-br from-teal-700/5 to-gold-300/10 p-8 dark:border-teal-100/10 dark:from-teal-500/10 dark:to-gold-500/10">
        <p className="font-arabic text-right text-3xl text-teal-700 dark:text-teal-300" dir="rtl">
          مَرْحَبًا بِكَ
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink-900 dark:text-parchment-50">Welcome back</h1>
        <p className="mt-1 max-w-lg text-ink-700 dark:text-parchment-200/90">
          Learn Qur'anic Arabic through stories built from its most common words — grammar included.
        </p>

        {nextStory ? (
          <Link
            to={`/stories/${nextStory.id}`}
            className="mt-5 inline-block rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-parchment-50 transition-colors hover:bg-teal-600 dark:bg-teal-500 dark:text-ink-950 dark:hover:bg-teal-400"
          >
            {completedStoryIds.includes(nextStory.id) ? 'Continue' : completedStoryIds.length === 0 ? 'Start your first story' : 'Continue'} — {nextStory.title} →
          </Link>
        ) : (
          <p className="mt-5 text-sm font-semibold text-leaf-500">
            You've completed every story so far — great work! Keep vocabulary sharp with flashcards.
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Day streak" value={streak.count} icon="🔥" />
        <StatTile label="Stories done" value={`${completedStoryIds.length}/${stories.length}`} icon="📖" />
        <StatTile label="Words introduced" value={`${wordsSeen}/${words.length}`} icon="📚" />
        <StatTile label="Words mastered" value={`${wordsMastered}/${wordsInProgress || 0}`} icon="🌟" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <QuickLink to="/flashcards" title="Flashcards" description="Pick up to 5 words and drill them." icon="🗂️" />
        <QuickLink
          to="/review"
          title="Review mistakes"
          description={mistakeQueue.length > 0 ? `${mistakeQueue.length} item(s) waiting for you.` : 'Nothing queued right now.'}
          icon="🛠️"
        />
        <QuickLink to="/vocab" title="Vocabulary bank" description="Browse every word you've met so far." icon="🔤" />
        <QuickLink to="/grammar" title="Grammar reference" description="Look back at every rule you've learned." icon="📐" />
        <QuickLink to="/lab" title="Sentence Lab" description="Write your own sentence and check it against the rules you've learned." icon="🧪" />
      </section>
    </div>
  )
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-2xl border border-teal-700/10 bg-white/60 p-4 text-center dark:border-teal-100/10 dark:bg-ink-900/40">
      <p className="text-2xl" aria-hidden>
        {icon}
      </p>
      <p className="mt-1 text-xl font-bold text-ink-900 dark:text-parchment-50">{value}</p>
      <p className="text-xs text-ink-600 dark:text-parchment-200/70">{label}</p>
    </div>
  )
}

function QuickLink({ to, title, description, icon }: { to: string; title: string; description: string; icon: string }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-2xl border border-teal-700/10 bg-white/60 p-4 transition-colors hover:border-teal-500/40 dark:border-teal-100/10 dark:bg-ink-900/40"
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-ink-900 dark:text-parchment-50">{title}</span>
        <span className="block text-sm text-ink-600 dark:text-parchment-200/70">{description}</span>
      </span>
    </Link>
  )
}
