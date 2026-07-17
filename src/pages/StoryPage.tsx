import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getStoryById, isStoryUnlocked } from '../data/stories'
import { useProgressStore } from '../store/progressStore'
import { StoryReader } from '../components/StoryReader'
import { FullStoryView } from '../components/FullStoryView'

type ReadingMode = 'lesson' | 'read'

export function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const completedStoryIds = useProgressStore((s) => s.completedStoryIds)
  const story = storyId ? getStoryById(storyId) : undefined
  const [mode, setMode] = useState<ReadingMode>('lesson')

  if (!story || !isStoryUnlocked(story, completedStoryIds)) {
    return <Navigate to="/" replace />
  }

  const tab = (m: ReadingMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        mode === m
          ? 'bg-teal-700 text-parchment-50 dark:bg-teal-500 dark:text-ink-950'
          : 'bg-teal-700/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-300'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <div className="mb-6">
        <p className="font-arabic text-right text-2xl text-teal-700 dark:text-teal-300" dir="rtl">
          {story.titleArabic}
        </p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">{story.title}</h1>
        <p className="text-sm text-ink-600 dark:text-parchment-200/80">{story.description}</p>
        <div className="mt-4 flex gap-2">
          {tab('lesson', '📝 Sentence by Sentence')}
          {tab('read', '📖 Full Story')}
        </div>
      </div>

      {mode === 'lesson' ? <StoryReader key={story.id} story={story} /> : <FullStoryView story={story} />}
    </div>
  )
}
