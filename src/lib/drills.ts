import type { NarrationSegment, Story } from '../types'
import { getStoryById } from '../data/stories'
import { getWordById } from '../data/words'

// Generators for the three lesson drills (mirroring the reference platform):
//  - change-one-word: one word in a real story sentence is swapped for a
//    grammatically wrong one; the student types the correct original word.
//  - true-false: the sentence is either intact or corrupted the same way.
//  - vocab-translate: English prompt → student writes the Arabic → reveal.
// Corruptions are limited to swaps we can make with CONFIDENCE that the
// result is wrong Arabic: preposition swaps, demonstrative gender flips,
// verb-prefix person flips, and كَانَ/كَانَتْ gender flips.

export interface WordDrillQuestion {
  kind: 'change-one-word'
  displaySentence: string
  transliteration: string
  english: string
  corruptedIndex: number
  correctToken: string
}

export interface TrueFalseQuestion {
  kind: 'true-false'
  displaySentence: string
  transliteration: string
  english: string
  isTrue: boolean
  originalSentence: string
  note: string
}

export interface VocabTranslateQuestion {
  kind: 'vocab-translate'
  english: string
  arabic: string
  transliteration: string
}

const PREPOSITION_SWAPS: Record<string, string[]> = {
  'فِي': ['عَلَى', 'مِنْ'],
  'مِنْ': ['فِي', 'إِلَى'],
  'إِلَى': ['مِنْ', 'عَلَى'],
  'عَلَى': ['فِي', 'إِلَى'],
  'مَعَ': ['فِي', 'عَلَى'],
}

const DIRECT_SWAPS: Record<string, string> = {
  'هَذَا': 'هَذِهِ',
  'هَذِهِ': 'هَذَا',
  'ذَلِكَ': 'تِلْكَ',
  'تِلْكَ': 'ذَلِكَ',
  'كَانَ': 'كَانَتْ',
  'كَانَتْ': 'كَانَ',
  'وَكَانَ': 'وَكَانَتْ',
  'وَكَانَتْ': 'وَكَانَ',
}

interface Corruption {
  tokens: string[]
  index: number
  original: string
  note: string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** try to corrupt one token of the sentence; null if no safe corruption exists */
function corrupt(sentence: string): Corruption | null {
  const tokens = sentence.split(' ')
  const candidates: { index: number; corrupted: string; note: string }[] = []

  tokens.forEach((token, index) => {
    const bare = token.replace(/[،؟!.]/g, '')
    if (PREPOSITION_SWAPS[bare]) {
      candidates.push({
        index,
        corrupted: token.replace(bare, pick(PREPOSITION_SWAPS[bare])),
        note: 'The preposition was wrong for this sentence.',
      })
    } else if (DIRECT_SWAPS[bare]) {
      candidates.push({
        index,
        corrupted: token.replace(bare, DIRECT_SWAPS[bare]),
        note: bare.includes('كَان')
          ? 'كَانَ must agree with its subject in gender.'
          : 'The demonstrative must match the noun\'s gender.',
      })
    } else if (/^ي[َُ]/.test(bare) && bare.length > 4) {
      // present-tense 3rd-person verb → flip يـ to تـ (person/gender error)
      candidates.push({
        index,
        corrupted: token.replace(/^ي/, 'ت'),
        note: 'The verb prefix marked the wrong person for this subject.',
      })
    }
  })

  if (candidates.length === 0) return null
  const chosen = pick(candidates)
  const corruptedTokens = [...tokens]
  corruptedTokens[chosen.index] = chosen.corrupted
  return { tokens: corruptedTokens, index: chosen.index, original: tokens[chosen.index], note: chosen.note }
}

function narrations(story: Story): NarrationSegment[] {
  return story.segments.filter((s): s is NarrationSegment => s.kind === 'narration')
}

export function makeChangeOneWord(storyId: string): WordDrillQuestion | null {
  const story = getStoryById(storyId)
  if (!story) return null
  const pool = narrations(story)
  for (let attempt = 0; attempt < 10; attempt++) {
    const seg = pick(pool)
    const c = corrupt(seg.arabic)
    if (c) {
      return {
        kind: 'change-one-word',
        displaySentence: c.tokens.join(' '),
        transliteration: seg.transliteration,
        english: seg.english,
        corruptedIndex: c.index,
        correctToken: c.original,
      }
    }
  }
  return null
}

export function makeTrueFalse(storyId: string): TrueFalseQuestion | null {
  const story = getStoryById(storyId)
  if (!story) return null
  const pool = narrations(story)
  for (let attempt = 0; attempt < 10; attempt++) {
    const seg = pick(pool)
    const shouldCorrupt = Math.random() < 0.5
    if (!shouldCorrupt) {
      return {
        kind: 'true-false',
        displaySentence: seg.arabic,
        transliteration: seg.transliteration,
        english: seg.english,
        isTrue: true,
        originalSentence: seg.arabic,
        note: 'The sentence is exactly as it appears in the story.',
      }
    }
    const c = corrupt(seg.arabic)
    if (c) {
      return {
        kind: 'true-false',
        displaySentence: c.tokens.join(' '),
        transliteration: seg.transliteration,
        english: seg.english,
        isTrue: false,
        originalSentence: seg.arabic,
        note: c.note,
      }
    }
  }
  return null
}

export function makeVocabTranslate(storyId: string): VocabTranslateQuestion | null {
  const story = getStoryById(storyId)
  if (!story) return null
  const word = getWordById(pick(story.newWordIds))
  if (!word) return null
  return {
    kind: 'vocab-translate',
    english: word.meaning.split(',')[0].split('(')[0].trim(),
    arabic: word.arabic,
    transliteration: word.transliteration,
  }
}

/** Diacritic/hamza-tolerant comparison for typed Arabic answers. */
export function arabicAnswersMatch(typed: string, expected: string): boolean {
  const norm = (s: string) =>
    s
      .replace(/[ً-ْٰـ]/g, '') // harakat, dagger alif, tatweel
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/[،؟!.]/g, '')
      .trim()
  return norm(typed) === norm(expected) && norm(typed).length > 0
}
