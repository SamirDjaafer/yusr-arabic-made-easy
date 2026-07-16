import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { stories } from '../data/stories'
import { useProgressStore } from '../store/progressStore'

export function StoriesPathPage() {
  const completedStoryIds = useProgressStore((s) => s.completedStoryIds)

  // the "you are here" marker: first story not yet completed
  const currentIndex = stories.findIndex((s) => !completedStoryIds.includes(s.id))
  const reachedIndex = currentIndex === -1 ? stories.length - 1 : currentIndex
  const progressPct = stories.length > 1 ? (reachedIndex / (stories.length - 1)) * 100 : 0

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold text-ink-900">Your path</h1>
      <p className="mt-1 text-sm text-ink-600">
        Six stories, each building on the last — read them in order, or revisit any one.
      </p>

      <div className="relative mt-8">
        <div className="absolute bottom-8 left-6 top-8 w-px bg-ink-900/10" aria-hidden />
        {/* gold fill showing how far along the path you've come */}
        <motion.div
          className="absolute left-6 top-8 w-px origin-top bg-gold-500"
          style={{ height: `calc((100% - 4rem) * ${progressPct / 100})` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          aria-hidden
        />

        <div className="space-y-4">
          {stories.map((story, i) => {
            const completed = completedStoryIds.includes(story.id)
            const isCurrent = i === currentIndex
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/stories/${story.id}`} className="group relative flex items-start gap-4">
                  <div className="relative z-10 mt-5 shrink-0">
                    {isCurrent && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/30" aria-hidden />
                    )}
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-semibold transition-colors ${
                        completed
                          ? 'border-gold-500 bg-gold-500 text-ink-950'
                          : isCurrent
                            ? 'border-gold-500 bg-white text-gold-700'
                            : 'border-ink-900/15 bg-white text-ink-700 group-hover:border-gold-500/60'
                      }`}
                    >
                      {completed ? '✓' : i + 1}
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-gold-500/50 group-hover:shadow-md">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">
                          Story {i + 1}
                          {completed && ' · completed'}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold leading-snug text-ink-900">{story.title}</h2>
                      </div>
                      <p className="font-arabic shrink-0 pt-1 text-2xl leading-relaxed text-ink-800" dir="rtl">
                        {story.titleArabic}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{story.description}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
