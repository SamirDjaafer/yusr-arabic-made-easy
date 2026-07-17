import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useProgressStore, STREAK_DAILY_TARGET } from '../../store/progressStore'
import { getStoryById } from '../../data/stories'

export function AppShell({ children }: { children: ReactNode }) {
  const streak = useProgressStore((s) => s.streak)
  const dailyActions = useProgressStore((s) => s.dailyActions)
  const savedToday = (dailyActions[new Date().toISOString().slice(0, 10)] ?? 0) >= STREAK_DAILY_TARGET
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const story = getStoryById(currentStoryId)
  const location = useLocation()
  const onSelectPage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
            <img src="/yusr-icon.svg" alt="Yusr Arabic" className="h-8 w-8 rounded-lg" />
            <span className="flex flex-col leading-tight">
              <span className="font-caps text-sm tracking-[0.18em] text-parchment-50">YUSR ARABIC</span>
              <span className="font-caps hidden text-[9px] tracking-[0.28em] text-gold-500 sm:block">ARABIC MADE EASY</span>
            </span>
          </NavLink>

          <div className="flex min-w-0 shrink items-center gap-2">
            {!onSelectPage && story && (
              <NavLink
                to="/portal"
                className={({ isActive }) =>
                  `truncate rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-500 text-ink-950' : 'text-parchment-100/85 hover:bg-white/10'
                  }`
                }
              >
                <span className="sm:hidden">Lesson {story.order}</span>
                <span className="hidden sm:inline">Lesson {story.order}: {story.title}</span>
              </NavLink>
            )}
            <div
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1.5 text-sm font-semibold text-gold-400"
              title={savedToday ? 'Progress saved today — streak secured' : `Do ${STREAK_DAILY_TARGET} cards or questions today to keep your streak`}
            >
              <span aria-hidden>🔥</span>
              <span>{streak.count}</span>
              {savedToday && <span className="text-leaf-500" aria-label="Progress saved today">✓</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-ink-600/70 sm:px-6 dark:text-parchment-200/50">
        Vocabulary and grammar notes are a curated learning aid, not a scholarly reference — cross-check with a
        teacher or trusted tafsīr as you go.
      </footer>
    </div>
  )
}
