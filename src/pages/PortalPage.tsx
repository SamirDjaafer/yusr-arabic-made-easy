import { Link } from 'react-router-dom'
import { useProgressStore } from '../store/progressStore'
import { getStoryById } from '../data/stories'
import { scopedConceptIds } from '../lib/lessonScope'
import { lexiconUpTo, principlesForLesson } from '../data/original/adapter'
import { DesertJourney } from '../components/DesertJourney'

export function PortalPage() {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const mistakeQueue = useProgressStore((s) => s.mistakeQueue)

  const story = getStoryById(currentStoryId)
  if (!story) return null

  const vocabCount = lexiconUpTo(story.order).length
  const grammarCount = scopedConceptIds(story.id).size + principlesForLesson(story.order).length

  const extras = [
    { to: '/lab', icon: '🧪', label: 'Sentences' },
    { to: '/vocab', icon: '🔤', label: `Vocab Bank (${vocabCount})` },
    { to: '/grammar', icon: '📐', label: `Grammar Reference (${grammarCount})` },
    { to: '/review', icon: '🛠️', label: mistakeQueue.length > 0 ? `Review (${mistakeQueue.length})` : 'Review' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">Curriculum</p>
          <h1 className="text-2xl font-semibold text-ink-900">
            Lesson {story.order}: {story.title}
          </h1>
        </div>
        <p className="font-arabic shrink-0 text-2xl text-ink-800" dir="rtl">
          {story.titleArabic}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-ink-900/10 shadow-md">
        <DesertJourney storyId={story.id} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {extras.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="rounded-full border border-ink-900/10 bg-white px-4 py-1.5 text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-gold-500/60 hover:bg-gold-200/20"
          >
            {e.icon} {e.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
