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

function lookupBare(bare: string, preferredIds?: Set<string>): string | undefined {
  if (preferredIds) {
    for (const id of preferredIds) {
      const w = getWordById(id)
      if (w && stripDiacritics(w.arabic) === bare) return id
    }
  }
  return BARE_INDEX.get(bare)
}

/** best-effort match: try the bare token, then progressively strip attached prefixes */
function matchToken(rawToken: string, preferredIds?: Set<string>): string | undefined {
  const bare = stripDiacritics(stripPunctuation(rawToken))
  if (!bare) return undefined
  const direct = lookupBare(bare, preferredIds)
  if (direct) return direct
  for (const prefix of PREFIXES) {
    if (bare.startsWith(prefix) && bare.length > prefix.length) {
      const stripped = lookupBare(bare.slice(prefix.length), preferredIds)
      if (stripped) return stripped
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
