// Core content types for the Qur'anic Arabic learning app.
// Content (words/grammar/stories) is authored as typed data in src/data,
// so a missing field or bad reference fails the build instead of failing silently at runtime.

export type PartOfSpeech =
  | 'noun'
  | 'proper-noun'
  | 'adjective'
  | 'verb'
  | 'pronoun'
  | 'demonstrative'
  | 'preposition'
  | 'particle'
  | 'relative-pronoun'

export interface Word {
  id: string
  arabic: string
  transliteration: string
  meaning: string
  root?: string // triliteral root, e.g. "ك-ت-ب"
  partOfSpeech: PartOfSpeech
  /** 1 = highest frequency tier (very small set covering a large share of the text), 3 = lower */
  frequencyTier: 1 | 2 | 3
  notes?: string
}

/** A generic flashcard face — satisfied by both a Word and a paradigm-derived inflected form. */
export interface FlashcardItem {
  id: string
  arabic: string
  transliteration: string
  meaning: string
  root?: string
  /** groups cards into a rotation, e.g. "Vocabulary", "Past tense of عَبَدَ" — same-category cards stay contiguous in a deck. */
  category: string
}

export interface ParadigmRow {
  /** the grammatical slot this row fills, e.g. "my", "you (m.)", "nominative, indefinite" */
  label: string
  arabic: string
  transliteration: string
  /** English meaning of the whole form, e.g. "my Lord" */
  gloss: string
}

export type ParadigmKind =
  | 'verb-past'
  | 'verb-present'
  | 'verb-future'
  | 'verb-imperative'
  | 'participle'
  | 'noun-suffix'
  | 'case'
  | 'other'

export interface Paradigm {
  /** e.g. "رَبّ (Lord) with every possessive suffix" */
  title: string
  /** lets deck-building group/pivot rows across paradigms by their grammatical row label (e.g. every "-tu" row across every verb) */
  kind?: ParadigmKind
  rows: ParadigmRow[]
}

export interface GrammarConcept {
  id: string
  title: string
  /** one-line summary shown on path map / glossary cards */
  summary: string
  /** longer explanation, shown in the grammar reference and correction panels. Plain text with \n\n paragraph breaks. */
  explanation: string
  examples: { arabic: string; transliteration: string; gloss: string }[]
  /** full paradigm tables showing every prefix/suffix/form applied to one word — the "how does this one word change" view. */
  paradigms?: Paradigm[]
  /** real multi-word example sentences grouped by a specific particle/word usage (e.g. one group per negation particle) — for "where is X used" decks. */
  contextDecks?: Paradigm[]
}

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-blank-ending'
  | 'word-order'
  | 'matching'
  | 'definiteness-choice'

interface ExerciseBase {
  id: string
  type: ExerciseType
  prompt: string
  explanation: string
  relatedGrammarId?: string
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: 'multiple-choice'
  options: string[]
  correctIndex: number
}

export interface FillBlankEndingExercise extends ExerciseBase {
  type: 'fill-blank-ending'
  /** sentence with a single ___ marking the blank */
  sentenceTemplate: string
  sentenceTransliteration: string
  options: string[]
  correctOption: string
}

export interface WordOrderExercise extends ExerciseBase {
  type: 'word-order'
  /** words in shuffled/display order */
  tiles: string[]
  correctOrder: string[]
  englishGloss: string
}

export interface MatchingExercise extends ExerciseBase {
  type: 'matching'
  pairs: { arabic: string; english: string }[]
}

export interface DefinitenessChoiceExercise extends ExerciseBase {
  type: 'definiteness-choice'
  englishPrompt: string
  options: string[]
  correctIndex: number
}

export type Exercise =
  | MultipleChoiceExercise
  | FillBlankEndingExercise
  | WordOrderExercise
  | MatchingExercise
  | DefinitenessChoiceExercise

export interface NarrationSegment {
  kind: 'narration'
  id: string
  arabic: string
  transliteration: string
  english: string
  /** word ids appearing in this line, for tap-to-inspect WordChips */
  wordIds?: string[]
  /** exact word-by-word (arabic, english) pairs in reading order, when the
   * source data provides them — used for tap-a-word-to-reveal in reading mode */
  wordGlosses?: { arabic: string; english: string }[]
}

export interface GrammarTipSegment {
  kind: 'grammar-tip'
  id: string
  grammarId: string
}

export interface ExerciseSegment {
  kind: 'exercise'
  id: string
  exercise: Exercise
}

export type StorySegment = NarrationSegment | GrammarTipSegment | ExerciseSegment

export interface Story {
  id: string
  order: number
  title: string
  titleArabic: string
  description: string
  /** story id that must be completed first; undefined = first story */
  unlockRequires?: string
  grammarConceptIds: string[]
  newWordIds: string[]
  segments: StorySegment[]
  endQuiz: Exercise[]
}

// --- progress & memorization state -----------------------------------------

export interface ExerciseAttempt {
  correct: boolean
  attempts: number
}

export interface StreakState {
  count: number
  /** ISO date (yyyy-mm-dd) of the last day the user did something */
  lastActiveDate: string | null
}

export interface ProgressStateData {
  completedStoryIds: string[]
  exerciseAttempts: Record<string, ExerciseAttempt>
  /** exercise ids the user got wrong and hasn't yet redeemed in /review */
  mistakeQueue: string[]
  streak: StreakState
}

export interface LeitnerCard {
  /** Leitner box 0 (new/hardest) .. 4 (mastered) */
  box: number
  nextReviewDate: string // ISO date
  lastResult: 'again' | 'hard' | 'good' | 'easy' | null
}

export interface FlashcardStateData {
  cards: Record<string, LeitnerCard>
}
