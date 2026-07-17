import type { FlashcardItem, GrammarConcept, ParadigmKind, ParadigmRow } from '../types'
import { getStoryById } from '../data/stories'
import { getWordById } from '../data/words'
import { getGrammarConcept } from '../data/grammar'
import { decksForLesson } from '../data/original/adapter'

export interface NamedDeck {
  id: string
  title: string
  cards: FlashcardItem[]
}

/** The flashcard deck for a story — the original database's deck(s) for that
    lesson (including sub-decks), falling back to the story's own word list. */
export function getStoryDeck(storyId: string): FlashcardItem[] {
  const story = getStoryById(storyId)
  if (!story) return []
  const original = decksForLesson(story.order).flatMap((d) => d.cards)
  if (original.length > 0) return original
  return story.newWordIds
    .map((id) => getWordById(id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))
    .map((w) => ({ id: w.id, arabic: w.arabic, transliteration: w.transliteration, meaning: w.meaning, root: w.root, category: 'Vocabulary' }))
}

function rowToCard(row: ParadigmRow, id: string, category: string): FlashcardItem {
  return { id, arabic: row.arabic, transliteration: row.transliteration, meaning: `${row.gloss} (${row.label})`, category }
}

function dedupeByArabic(cards: FlashcardItem[]): FlashcardItem[] {
  const seen = new Set<string>()
  const out: FlashcardItem[] = []
  for (const c of cards) {
    if (seen.has(c.arabic)) continue
    seen.add(c.arabic)
    out.push(c)
  }
  return out
}

/** For case-ending rows, group by the case itself (nominative/accusative/genitive) regardless of definiteness. */
function caseGroupKey(label: string): string {
  if (label.includes('nominative')) return 'nominative (رَفْع)'
  if (label.includes('accusative')) return 'accusative (نَصْب)'
  if (label.includes('genitive')) return 'genitive (جَرّ)'
  return label
}

const PIVOTS: { kind: ParadigmKind; deckPrefix: string; titlePrefix: string; groupKey?: (label: string) => string }[] = [
  { kind: 'verb-past', deckPrefix: 'past-suffix', titlePrefix: 'Past-tense suffix' },
  { kind: 'verb-present', deckPrefix: 'present-prefix', titlePrefix: 'Present-tense prefix' },
  { kind: 'noun-suffix', deckPrefix: 'poss-suffix', titlePrefix: 'Possessive suffix' },
  { kind: 'case', deckPrefix: 'case', titlePrefix: 'Case ending', groupKey: caseGroupKey },
]

/**
 * The full deck MENU for a story: separate, individually-selectable decks —
 * vocabulary, past-tense verb roots, present-tense verb roots, one deck per
 * suffix/prefix (pivoted across every verb/noun that demonstrates it, so the
 * same suffix repeats across different words), one deck per negation
 * particle showing it in real sentences, and a multi-word phrase deck.
 * This mirrors how the reference app (Yusr Arabic) separates decks you
 * click into individually, rather than one long mixed session.
 */
export function getStoryDeckMenu(storyId: string): NamedDeck[] {
  const story = getStoryById(storyId)
  if (!story) return []

  const decks: NamedDeck[] = []

  // 1. Vocabulary
  const vocabCards: FlashcardItem[] = story.newWordIds
    .map((id) => getWordById(id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))
    .map((w) => ({ id: w.id, arabic: w.arabic, transliteration: w.transliteration, meaning: w.meaning, root: w.root, category: 'Vocabulary' }))
  if (vocabCards.length > 0) {
    decks.push({ id: 'vocabulary', title: `Vocabulary (${vocabCards.length})`, cards: vocabCards })
  }

  const concepts = story.grammarConceptIds
    .map((id) => getGrammarConcept(id))
    .filter((c): c is GrammarConcept => Boolean(c))

  // 2. Past-tense / present-tense verb ROOT decks (just the "he" dictionary form of each verb taught)
  const pastRoots: FlashcardItem[] = []
  const presentRoots: FlashcardItem[] = []
  for (const c of concepts) {
    for (const p of c.paradigms ?? []) {
      const heRow = p.rows.find((r) => r.label === 'he')
      if (!heRow) continue
      if (p.kind === 'verb-past') pastRoots.push(rowToCard(heRow, `root-past-${heRow.arabic}`, 'Past tense verbs'))
      if (p.kind === 'verb-present') presentRoots.push(rowToCard(heRow, `root-present-${heRow.arabic}`, 'Present tense verbs'))
    }
  }
  if (pastRoots.length > 0) decks.push({ id: 'past-verbs', title: `Past tense verbs (${dedupeByArabic(pastRoots).length})`, cards: dedupeByArabic(pastRoots) })
  if (presentRoots.length > 0) decks.push({ id: 'present-verbs', title: `Present tense verbs (${dedupeByArabic(presentRoots).length})`, cards: dedupeByArabic(presentRoots) })

  // 3. Per-suffix/prefix/case pivot decks — same grammatical slot, across every word that demonstrates it
  for (const pivot of PIVOTS) {
    const byGroup = new Map<string, FlashcardItem[]>()
    for (const c of concepts) {
      for (const p of c.paradigms ?? []) {
        if (p.kind !== pivot.kind) continue
        for (const row of p.rows) {
          const key = pivot.groupKey ? pivot.groupKey(row.label) : row.label
          const list = byGroup.get(key) ?? []
          list.push(rowToCard(row, `${pivot.deckPrefix}-${key}-${row.arabic}`, `${pivot.titlePrefix}: ${key}`))
          byGroup.set(key, list)
        }
      }
    }
    for (const [group, cards] of byGroup) {
      const unique = dedupeByArabic(cards)
      if (unique.length === 0) continue
      decks.push({
        id: `${pivot.deckPrefix}-${group}`.replace(/\s+/g, '-'),
        title: `${pivot.titlePrefix}: ${group} (${unique.length})`,
        cards: unique,
      })
    }
  }

  // 3b. Any paradigm whose kind isn't one of the pivoted ones (demonstratives, adjective agreement,
  // plural/dual) still becomes its own standalone deck, so nothing taught is left out of the menu.
  const pivotedKinds = new Set(PIVOTS.map((p) => p.kind))
  for (const c of concepts) {
    for (const p of c.paradigms ?? []) {
      if (p.kind && pivotedKinds.has(p.kind)) continue
      const cards = p.rows.map((row, i) => rowToCard(row, `standalone-${p.title}-${i}`, p.title))
      decks.push({ id: `standalone-${p.title}`.replace(/\s+/g, '-'), title: `${p.title} (${cards.length})`, cards })
    }
  }

  // 4. Particle-in-context decks (negation: لا/ما/لم/لن/ليس, each with real multi-word sentences)
  for (const c of concepts) {
    for (const ctx of c.contextDecks ?? []) {
      const cards = ctx.rows.map((row, i) => rowToCard(row, `ctx-${ctx.title}-${i}`, ctx.title))
      decks.push({ id: `ctx-${ctx.title}`.replace(/\s+/g, '-'), title: ctx.title, cards })
    }
  }

  // 5. Multi-word phrases — full sentences (3+ words) straight from this story's narration
  const phraseCards: FlashcardItem[] = story.segments
    .filter((s) => s.kind === 'narration' && s.arabic.trim().split(/\s+/).length >= 3)
    .slice(0, 8)
    .map((s) => {
      const seg = s as Extract<typeof s, { kind: 'narration' }>
      return { id: `phrase-${seg.id}`, arabic: seg.arabic, transliteration: seg.transliteration, meaning: seg.english, category: 'Multi-word phrases' }
    })
  if (phraseCards.length > 0) {
    decks.push({ id: 'phrases', title: `Multi-word phrases (${phraseCards.length})`, cards: phraseCards })
  }

  return decks
}
