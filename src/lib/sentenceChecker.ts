import { words } from '../data/words'
import type { Word } from '../types'

// A best-effort, fully local/offline heuristic checker — not a real Arabic
// parser. It recognises words by stripping the specific prefixes/suffixes
// this app teaches, and flags one specific rule it can check with
// confidence (noun-adjective definiteness agreement). Everything else is
// left for the learner (or a teacher) to judge — the point is to give
// instant, free feedback on the mechanics we've actually taught, not to
// simulate a native speaker.

const DIACRITICS = /[ً-ْٰٓ-ٟ]/g

function stripDiacritics(s: string): string {
  return s.replace(DIACRITICS, '').trim()
}

function normalize(s: string): string {
  return stripDiacritics(s)
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[؟!.,،؛:]/g, '')
    .trim()
}

const PREFIXES = ['بال', 'وال', 'فال', 'كال', 'لل', 'ال', 'وَ', 'و', 'فَ', 'ف', 'بِ', 'ب', 'لِ', 'ل', 'كَ', 'ك']
const SUFFIXES = [
  'كما', 'هما', 'تما',
  'كم', 'كن', 'هم', 'هن', 'نا', 'تم', 'تن',
  'ونَ', 'ينَ', 'ون', 'ين', 'ات', 'ان',
  'هُ', 'ه', 'هِ', 'ها', 'كِ', 'كَ', 'ك', 'ي', 'تُ', 'ت', 'تِ',
]

interface WordIndexEntry {
  word: Word
  normalized: string
}

let indexCache: WordIndexEntry[] | null = null
function getIndex(): WordIndexEntry[] {
  if (!indexCache) {
    indexCache = words.map((w) => ({ word: w, normalized: normalize(w.arabic) }))
  }
  return indexCache
}

export interface TokenResult {
  raw: string
  recognized: boolean
  matchedWord?: Word
  note?: string
  hasDefiniteArticle: boolean
}

export interface CheckResult {
  tokens: TokenResult[]
  issues: string[]
  unrecognizedCount: number
  verdict: 'empty' | 'looks-consistent' | 'has-issues'
}

function findExact(normTok: string): Word | undefined {
  return getIndex().find((e) => e.normalized === normTok)?.word
}

function tryStrip(token: string): { word: Word; note: string } | undefined {
  const bareToken = normalize(token)

  for (const suf of SUFFIXES) {
    const nsuf = normalize(suf)
    if (nsuf && bareToken.endsWith(nsuf) && bareToken.length > nsuf.length + 1) {
      const stem = bareToken.slice(0, -nsuf.length)
      const match = findExact(stem)
      if (match) return { word: match, note: `recognized as ${match.arabic} + suffix ـ${suf}` }
    }
  }

  for (const pre of PREFIXES) {
    const npre = normalize(pre)
    if (npre && bareToken.startsWith(npre) && bareToken.length > npre.length + 1) {
      const stem = bareToken.slice(npre.length)
      const match = findExact(stem)
      if (match) return { word: match, note: `recognized as prefix ${pre}ـ + ${match.arabic}` }
    }
  }

  // prefix + suffix together (e.g. الرجل + suffix, or wa + noun + suffix)
  for (const pre of PREFIXES) {
    const npre = normalize(pre)
    if (!npre || !bareToken.startsWith(npre)) continue
    const afterPrefix = bareToken.slice(npre.length)
    for (const suf of SUFFIXES) {
      const nsuf = normalize(suf)
      if (nsuf && afterPrefix.endsWith(nsuf) && afterPrefix.length > nsuf.length + 1) {
        const stem = afterPrefix.slice(0, -nsuf.length)
        const match = findExact(stem)
        if (match) return { word: match, note: `recognized as ${pre}ـ + ${match.arabic} + ـ${suf}` }
      }
    }
  }

  return undefined
}

function hasAl(token: string): boolean {
  const t = normalize(token)
  return t.startsWith('ال') || /^(و|ف|ب|ك)ال/.test(t)
}

export function checkSentence(input: string): CheckResult {
  const rawTokens = input.trim().split(/\s+/).filter(Boolean)
  if (rawTokens.length === 0) {
    return { tokens: [], issues: [], unrecognizedCount: 0, verdict: 'empty' }
  }

  const tokens: TokenResult[] = rawTokens.map((raw) => {
    const norm = normalize(raw)
    const exact = findExact(norm)
    if (exact) {
      return { raw, recognized: true, matchedWord: exact, hasDefiniteArticle: hasAl(raw) }
    }
    const stripped = tryStrip(raw)
    if (stripped) {
      return { raw, recognized: true, matchedWord: stripped.word, note: stripped.note, hasDefiniteArticle: hasAl(raw) }
    }
    return { raw, recognized: false, hasDefiniteArticle: hasAl(raw) }
  })

  const issues: string[] = []

  // Definiteness-agreement check: a recognized noun immediately followed by
  // a recognized adjective should match on ال.
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i]
    const b = tokens[i + 1]
    if (!a.matchedWord || !b.matchedWord) continue
    if (a.matchedWord.partOfSpeech !== 'noun' && a.matchedWord.partOfSpeech !== 'proper-noun') continue
    if (b.matchedWord.partOfSpeech !== 'adjective') continue
    if (a.hasDefiniteArticle !== b.hasDefiniteArticle) {
      issues.push(
        `"${a.raw} ${b.raw}" — definiteness mismatch: ${a.hasDefiniteArticle ? 'the noun has ال but the adjective doesn\'t' : 'the adjective has ال but the noun doesn\'t'}. An adjective must match its noun — both definite or both indefinite.`,
      )
    }
  }

  const unrecognizedCount = tokens.filter((t) => !t.recognized).length
  if (unrecognizedCount > 0) {
    const list = tokens.filter((t) => !t.recognized).map((t) => t.raw).join(', ')
    issues.push(`${unrecognizedCount} word(s) not recognized from what you've learned so far: ${list}. That's not necessarily wrong — it just means this checker can't verify them yet.`)
  }

  const verdict: CheckResult['verdict'] = issues.length === 0 ? 'looks-consistent' : 'has-issues'
  return { tokens, issues, unrecognizedCount, verdict }
}
