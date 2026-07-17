import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgressStore } from '../../store/progressStore'
import { stories } from '../../data/stories'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/stories', label: 'Stories' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/vocab', label: 'Vocab' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/review', label: 'Review' },
  { to: '/lab', label: 'Sentences' },
]

function LessonPicker({ className = '' }: { className?: string }) {
  const currentStoryId = useProgressStore((s) => s.currentStoryId)
  const setCurrentStory = useProgressStore((s) => s.setCurrentStory)
  return (
    <select
      value={currentStoryId}
      onChange={(e) => setCurrentStory(e.target.value)}
      title="The lesson you're on — scopes vocab, grammar, exercises and challenges"
      className={`max-w-full cursor-pointer rounded-full border border-gold-500/40 bg-transparent px-3 py-1.5 text-sm font-semibold text-gold-400 outline-none ${className}`}
    >
      {stories.map((s) => (
        <option key={s.id} value={s.id} className="bg-ink-900 text-parchment-50">
          Lesson {s.order}: {s.title}
        </option>
      ))}
    </select>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const streak = useProgressStore((s) => s.streak)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // close the mobile menu on ANY navigation, including links inside the page
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-gold-500/20 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <img src="/yusr-icon.svg" alt="Yusr Arabic" className="h-8 w-8 rounded-lg" />
            <span className="flex flex-col leading-tight">
              <span className="font-caps text-sm tracking-[0.18em] text-parchment-50">YUSR ARABIC</span>
              <span className="font-caps text-[9px] tracking-[0.28em] text-gold-500">ARABIC MADE EASY</span>
            </span>
          </NavLink>

          {/* desktop nav */}
          <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 sm:flex md:gap-1.5">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-500 text-ink-950' : 'text-parchment-100/85 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LessonPicker className="hidden lg:block" />
            <div
              className="flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1.5 text-sm font-semibold text-gold-400"
              title="Daily streak"
            >
              <span aria-hidden>🔥</span>
              <span>{streak.count}</span>
            </div>

            {/* mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-parchment-50 transition-colors hover:bg-white/10 sm:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* mobile menu panel */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/10 sm:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                <div className="pb-2">
                  <LessonPicker className="w-full" />
                </div>
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-gold-500 text-ink-950' : 'text-parchment-100/85 hover:bg-white/10'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-ink-600/70 sm:px-6 dark:text-parchment-200/50">
        Vocabulary and grammar notes are a curated learning aid, not a scholarly reference — cross-check with a
        teacher or trusted tafsīr as you go.
      </footer>
    </div>
  )
}
