import type { NarrationSegment } from '../types'
import { words, getWordById } from '../data/words'

export interface GlossToken {
  arabic: string
  meaning?: string
  transliteration?: string
}

const stripDiacritics = (s: string) => s.replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي')
const stripPunctuation = (s: string) => s.replace(/[،؟!.:؛]/g, '')

const BARE_INDEX = new Map<string, string>() // bare arabic -> word id (first writer wins)
for (const w of words) {
  const bare = stripDiacritics(w.arabic)
  if (!BARE_INDEX.has(bare)) BARE_INDEX.set(bare, w.id)
}

// single-letter attached prefixes (conjunctions/prepositions), tried longest-first
const PREFIXES = ['بال', 'وال', 'فال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك']

// attached possessive-pronoun suffixes, longest-first (kept to 2+ letters —
// stripping a single trailing letter risks matching an unrelated word)
const SUFFIXES = ['هما', 'كما', 'هُنَّ', 'هم', 'هن', 'كم', 'كن', 'نا', 'ها', 'ني']

function lookupBare(bare: string, preferredIds?: Set<string>): string | undefined {
  if (preferredIds) {
    for (const id of preferredIds) {
      const w = getWordById(id)
      if (w && stripDiacritics(w.arabic) === bare) return id
    }
  }
  return BARE_INDEX.get(bare)
}

/** try a bare form directly, then with a dangling accusative-indefinite alif (تنوين النصب) removed */
function lookupWithCaseAlif(bare: string, preferredIds?: Set<string>): string | undefined {
  const direct = lookupBare(bare, preferredIds)
  if (direct) return direct
  if (bare.endsWith('ا') && bare.length > 1) return lookupBare(bare.slice(0, -1), preferredIds)
  return undefined
}

/** best-effort match: try the bare token, then progressively strip attached prefixes/suffixes */
function matchToken(rawToken: string, preferredIds?: Set<string>): string | undefined {
  const bare = stripDiacritics(stripPunctuation(rawToken))
  if (!bare) return undefined

  const direct = lookupWithCaseAlif(bare, preferredIds)
  if (direct) return direct

  for (const prefix of PREFIXES) {
    if (bare.startsWith(prefix) && bare.length > prefix.length) {
      const stripped = lookupWithCaseAlif(bare.slice(prefix.length), preferredIds)
      if (stripped) return stripped
    }
  }

  for (const suffix of SUFFIXES) {
    if (bare.endsWith(suffix) && bare.length > suffix.length) {
      const stem = bare.slice(0, -suffix.length)
      const stripped = lookupWithCaseAlif(stem, preferredIds)
      if (stripped) return stripped
      // suffix could be stacked on a prefixed word too (e.g. وَقَرْيَتِهِ)
      for (const prefix of PREFIXES) {
        if (stem.startsWith(prefix) && stem.length > prefix.length) {
          const both = lookupWithCaseAlif(stem.slice(prefix.length), preferredIds)
          if (both) return both
        }
      }
    }
  }

  return undefined
}

/**
 * Word-by-word glosses for a narration segment, for tap-a-word-to-reveal in
 * reading mode. Prefers exact data from the source database (wordGlosses,
 * populated for lessons sourced from the original platform); falls back to
 * a best-effort dictionary match (against this segment's tagged wordIds,
 * then the full vocabulary) for the hand-authored stories, which only carry
 * an unordered wordIds list rather than a word-by-word alignment.
 */
export function glossSegment(segment: NarrationSegment): GlossToken[] {
  if (segment.wordGlosses && segment.wordGlosses.length > 0) {
    return segment.wordGlosses.map((g) => ({ arabic: g.arabic, meaning: g.english }))
  }

  const preferredIds = segment.wordIds ? new Set(segment.wordIds) : undefined
  return segment.arabic.split(' ').map((token) => {
    const id = matchToken(token, preferredIds)
    const word = id ? getWordById(id) : undefined
    return {
      arabic: token,
      meaning: word?.meaning,
      transliteration: word?.transliteration,
    }
  })
}
