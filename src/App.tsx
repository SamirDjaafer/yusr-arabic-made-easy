import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LessonSelectPage } from './pages/LessonSelectPage'
import { PortalPage } from './pages/PortalPage'
import { StoryPage } from './pages/StoryPage'
import { FlashcardsPage } from './pages/FlashcardsPage'
import { VocabBankPage } from './pages/VocabBankPage'
import { GrammarReferencePage } from './pages/GrammarReferencePage'
import { ReviewPage } from './pages/ReviewPage'
import { SentenceLabPage } from './pages/SentenceLabPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { ChallengesPage } from './pages/ChallengesPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LessonSelectPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/stories" element={<Navigate to="/" replace />} />
          <Route path="/stories/:storyId" element={<StoryPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/vocab" element={<VocabBankPage />} />
          <Route path="/grammar" element={<GrammarReferencePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/lab" element={<SentenceLabPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
