// Adapters that map the vendored original Yusr Arabic database into this
// app's typed structures. The original content is the base; our own grammar
// system (concepts, word-forms explorer) layers on top.
import * as db from './lessonDatabase'
import { arabicMasterDatabase } from './masterLexicon'
import type { FlashcardItem, NarrationSegment, Story, Word } from '../../types'

const anyDb = db as Record<string, unknown>

function poolFor<T>(prefix: string, lesson: number): T[] {
  const key = lesson === 1 ? prefix : `${prefix}_L${lesson}`
  return (anyDb[key] as T[]) ?? []
}

// --- stories ----------------------------------------------------------------

interface DbStorySentence {
  words: { ar: string; en: string; isNew: boolean }[]
  en: string
}
interface DbStory {
  lesson: number
  title: string
  titleEn: string
  text: string
  sentences?: DbStorySentence[]
  principles?: { q: string; a: string }[]
}

const LESSON_STORIES = (anyDb.LESSON_STORIES as DbStory[]) ?? []

/** Stories for lessons >= fromOrder, straight from the original database. */
export function originalStoriesFrom(fromOrder: number): Story[] {
  return LESSON_STORIES.filter((ls) => ls.lesson >= fromOrder).map((ls) => {
    const lines = (ls.text ?? '').split('\n')
    const sentences = ls.sentences ?? []
    const segments: NarrationSegment[] = sentences.map((s, i) => ({
      kind: 'narration',
      id: `s${ls.lesson}-orig-${i}`,
      arabic: lines[i] ?? s.words.map((w) => w.ar).join(' '),
      transliteration: '',
      english: s.en,
    }))
    return {
      id: `story-${String(ls.lesson).padStart(2, '0')}`,
      order: ls.lesson,
      title: ls.titleEn,
      titleArabic: ls.title,
      description: sentences[0]?.en ?? ls.titleEn,
      grammarConceptIds: [],
      newWordIds: [],
      segments,
      endQuiz: [],
    }
  })
}

/** word-by-word glosses for a lesson's story (for tap-to-reveal), keyed by segment index */
export function storyWordGlosses(lesson: number): DbStorySentence[] {
  return LESSON_STORIES.find((ls) => ls.lesson === lesson)?.sentences ?? []
}

/** the original per-lesson grammar principles (Q&A; q may contain simple HTML) */
export function principlesForLesson(lesson: number): { q: string; a: string }[] {
  return LESSON_STORIES.find((ls) => ls.lesson === lesson)?.principles ?? []
}

// --- flashcard decks --------------------------------------------------------

export interface OriginalDeck {
  key: string
  lesson: number
  name: string
  cards: FlashcardItem[]
}

const DEFAULT_LESSONS = anyDb.DEFAULT_LESSONS as Record<string, { name: string; cards: { ar: string; en: string }[] }>

export function getOriginalDecks(): OriginalDeck[] {
  const out: OriginalDeck[] = []
  for (const [key, entry] of Object.entries(DEFAULT_LESSONS)) {
    const lesson = parseInt(key, 10)
    if (!lesson || !entry.cards?.length) continue
    out.push({
      key,
      lesson,
      name: entry.name,
      cards: entry.cards.map((c) => ({
        id: `od-${key}-${c.ar}`,
        arabic: c.ar,
        transliteration: '',
        meaning: c.en,
        category: 'Vocabulary',
      })),
    })
  }
  return out.sort((a, b) => a.lesson - b.lesson || a.key.localeCompare(b.key))
}

export function decksForLesson(lesson: number): OriginalDeck[] {
  return getOriginalDecks().filter((d) => d.lesson === lesson)
}

// --- exercise pools ---------------------------------------------------------

export interface OrigChangeWord {
  sentence: string
  wrong: string
  correct: string
  en: string
  enWrong: string
}
export function changeWordPool(lesson: number): OrigChangeWord[] {
  return poolFor<OrigChangeWord>('CHANGE_WORD_QUESTIONS', lesson)
}

export interface OrigTrueFalse {
  sentence: string
  answer: boolean
  en: string
}
export function trueFalsePool(lesson: number): OrigTrueFalse[] {
  return poolFor<OrigTrueFalse>('TRUE_FALSE_QUESTIONS', lesson)
}

export interface OrigQA {
  ar: string
  en: string
}
export function comprehensionPool(lesson: number): OrigQA[] {
  return (anyDb[`COMPREHENSION_QUESTIONS_L${lesson}`] as OrigQA[]) ?? []
}

export function challenge1Words(lesson: number): OrigQA[] {
  return poolFor<OrigQA>('CHALLENGE_1_WORDS', lesson)
}

export interface OrigTranslate {
  en: string
  ar: string
}
export function challenge2Sentences(lesson: number): OrigTranslate[] {
  return poolFor<OrigTranslate>('CHALLENGE_2_SENTENCES', lesson)
}

export interface OrigFillGap {
  sentence: string
  answer: string
}
export function fillGapPool(lesson: number): OrigFillGap[] {
  return lesson === 1 ? ((anyDb.FILL_GAP_QUESTIONS as OrigFillGap[]) ?? []) : []
}

export interface OrigWordOrder {
  words: string[]
  answer: string
}
export function wordOrderPool(lesson: number): OrigWordOrder[] {
  return lesson === 1 ? ((anyDb.WORD_ORDER_QUESTIONS as OrigWordOrder[]) ?? []) : []
}

// --- vocab lexicon ----------------------------------------------------------

interface LexEntry {
  list: number
  word: string
  meaning: string
  partOfSpeech: string
  gender?: string
  plurality?: string
  aspect?: string
}

const POS_MAP: Record<string, Word['partOfSpeech']> = {
  noun: 'noun',
  adjective: 'adjective',
  verb: 'verb',
  particle: 'particle',
  pronoun: 'pronoun',
  numeral: 'noun',
}

/** the original master lexicon up to (and including) a lesson, adapted to our Word shape */
export function lexiconUpTo(lesson: number): Word[] {
  return (arabicMasterDatabase as LexEntry[])
    .filter((e) => e.list <= lesson)
    .map((e, i) => ({
      id: `lex-${e.list}-${i}-${e.word}`,
      arabic: e.word,
      transliteration: '',
      meaning: e.meaning,
      partOfSpeech: POS_MAP[e.partOfSpeech] ?? 'particle',
      frequencyTier: (e.list <= 5 ? 1 : e.list <= 11 ? 2 : 3) as 1 | 2 | 3,
      notes: [e.aspect ? `${e.aspect} tense` : '', e.plurality === 'plur' ? 'plural' : '', e.gender === 'f' ? 'feminine' : '']
        .filter(Boolean)
        .join(' · ') || undefined,
    }))
}

export const MAX_LESSON = Math.max(...LESSON_STORIES.map((ls) => ls.lesson))
