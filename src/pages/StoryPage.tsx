import { Navigate, useParams } from 'react-router-dom'
import { getStoryById, isStoryUnlocked } from '../data/stories'
import { useProgressStore } from '../store/progressStore'
import { StoryReader } from '../components/StoryReader'

export function StoryPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const completedStoryIds = useProgressStore((s) => s.completedStoryIds)
  const story = storyId ? getStoryById(storyId) : undefined

  if (!story || !isStoryUnlocked(story, completedStoryIds)) {
    return <Navigate to="/stories" replace />
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-arabic text-right text-2xl text-teal-700 dark:text-teal-300" dir="rtl">
          {story.titleArabic}
        </p>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-parchment-50">{story.title}</h1>
        <p className="text-sm text-ink-600 dark:text-parchment-200/80">{story.description}</p>
      </div>
      <StoryReader key={story.id} story={story} />
    </div>
  )
}
