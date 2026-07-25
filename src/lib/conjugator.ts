import type { Paradigm, Word } from '../types'
import { words } from '../data/words'

// Generates full inflection tables (every person for verbs; every possessive
// suffix and case ending for nouns) for the REGULAR words in the vocabulary.
// Arabic morphology is only string-concatenation-safe for sound roots — weak
// (hollow/defective), doubled, and hamza-initial words break the patterns —
// so those are either served from hand-authored tables below or excluded
// entirely. Honest exclusion beats a confidently wrong table.

const FATHA = 'َ'
const DAMMA = 'ُ'
const KASRA = 'ِ'
const SUKUN = 'ْ'
const SHADDA = 'ّ'
const TANWIN_DAMM = 'ٌ'
const TANWIN_FATH = 'ً'
const TANWIN_KASR = 'ٍ'

const SUN_LETTERS: Record<string, string> = {
  'ت': 't', 'ث': 'th', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
  'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ل': 'l', 'ن': 'n',
}

const WEAK_LETTERS = ['و', 'ي', 'ا', 'ى']

function rootLetters(word: Word): string[] | null {
  if (!word.root) return null
  return word.root.split('-').map((l) => l.trim())
}

/** Sound = safe to conjugate in the PAST tense by concatenation. */
function isPastSound(word: Word): boolean {
  const letters = rootLetters(word)
  if (!letters || letters.length !== 3) return false
  const [, r2, r3] = letters
  if (WEAK_LETTERS.includes(r2) || WEAK_LETTERS.includes(r3)) return false
  if (['أ', 'ء', 'ئ', 'ؤ'].includes(r3)) return false // final hamza: seat changes in some persons
  if (r2 === r3) return false // doubled verbs geminate
  return true
}

// --- past tense -------------------------------------------------------------

export function conjugatePast(word: Word): Paradigm | null {
  const hand = HAND_AUTHORED[word.id]?.past
  if (hand) return hand
  if (word.partOfSpeech !== 'verb' || !isPastSound(word)) return null
  // only base "he did" dictionary forms — not already-conjugated entries
  // like يُؤْمِنُونَ ("they believe") or multi-word forms like لَنْ يَتْرُكَ
  if (!/^(he|it) /.test(word.meaning) || word.arabic.includes(' ')) return null

  const base = word.arabic
  if (!base.endsWith(FATHA)) return null
  const stem = base.slice(0, -1) // عَبَدَ -> عَبَد
  const stemSukun = stem + SUKUN // عَبَدْ

  const t = word.transliteration
  if (!t.endsWith('a')) return null
  const tStem = t.slice(0, -1)

  const lastRadical = rootLetters(word)![2]
  // "we"/"they (fem.)": normally stem+ْ+نَا / stem+ْ+نَ, but a final-ن radical assimilates: سَكَنَّا / سَكَنَّ
  const weArabic = lastRadical === 'ن' ? stem + SHADDA + FATHA + 'ا' : stemSukun + 'نَا'
  const theyFemArabic = lastRadical === 'ن' ? stem + SHADDA + FATHA : stemSukun + 'نَ'

  const meaningBase = word.meaning.replace(/^he /, '').replace(/ \(root\/past-tense form\)/, '')

  return {
    title: `Past tense (الماضي) of ${word.arabic} — every person`,
    kind: 'verb-past',
    rows: [
      { label: 'I', arabic: stemSukun + 'تُ', transliteration: tStem + 'tu', gloss: `I ${meaningBase}` },
      { label: 'you (masc.)', arabic: stemSukun + 'تَ', transliteration: tStem + 'ta', gloss: `you ${meaningBase}` },
      { label: 'you (fem.)', arabic: stemSukun + 'تِ', transliteration: tStem + 'ti', gloss: `you ${meaningBase}` },
      { label: 'he', arabic: base, transliteration: t, gloss: `he ${meaningBase}` },
      { label: 'she', arabic: stem + FATHA + 'تْ', transliteration: tStem + 'at', gloss: `she ${meaningBase}` },
      { label: 'we', arabic: weArabic, transliteration: tStem + 'nā', gloss: `we ${meaningBase}` },
      { label: 'you (masc. plural)', arabic: stemSukun + 'تُمْ', transliteration: tStem + 'tum', gloss: `you (m. pl.) ${meaningBase}` },
      { label: 'you (fem. plural)', arabic: stemSukun + 'تُنَّ', transliteration: tStem + 'tunna', gloss: `you (f. pl.) ${meaningBase}` },
      { label: 'they (masc.)', arabic: stem + DAMMA + 'وا', transliteration: tStem + 'ū', gloss: `they (m.) ${meaningBase}` },
      { label: 'they (fem.)', arabic: theyFemArabic, transliteration: tStem + 'na', gloss: `they (f.) ${meaningBase}` },
    ],
  }
}

// --- present tense ----------------------------------------------------------

export function conjugatePresent(word: Word): Paradigm | null {
  const hand = HAND_AUTHORED[word.id]?.present
  if (hand) return hand
  if (word.partOfSpeech !== 'verb') return null
  // geminate roots (r2 === r3, e.g. دَلَّ/يَدُلُّ) unpack the doubled consonant
  // before consonant-initial suffixes (تَدْلُلْنَ) — the shadda is a diacritic,
  // not a distinct letter, so the weak-letter scan below can't catch this;
  // these need a hand-authored table instead.
  const rl = rootLetters(word)
  if (rl && rl.length === 3 && rl[1] === rl[2]) return null

  const base = word.arabic
  // must be a present-tense "he" form: يَـ or يُـ prefix, indicative -u ending
  if (!(base.startsWith('ي' + FATHA) || base.startsWith('ي' + DAMMA))) return null
  if (!base.endsWith(DAMMA)) return null

  const prefixVowel = base[1]
  const core = base.slice(2, -1) // يَعْبُدُ -> عْبُد

  // defective (ends in a weak letter) or hamza-initial cores break concatenation
  // — those still need a hand-authored table. A single MEDIAL weak letter
  // (hollow, e.g. يُرِيدُ, يَقُومُ) is handled generically below: it shortens
  // in the feminine plural (يُرِدْنَ، يَقُمْنَ) but is otherwise regular.
  const coreBare = core.replace(/[ً-ْ]/g, '')
  if (WEAK_LETTERS.includes(coreBare[coreBare.length - 1])) return null
  if (['أ', 'ء', 'ؤ'].includes(coreBare[0])) return null // hamza-initial cores (يُؤْمِنُ → أُومِنُ) need special handling
  const weakPositions = [...coreBare].reduce<number[]>((acc, ch, i) => (WEAK_LETTERS.includes(ch) ? [...acc, i] : acc), [])
  const isHollow = weakPositions.length === 1 && weakPositions[0] > 0 && weakPositions[0] < coreBare.length - 1
  if (!isHollow && weakPositions.length > 0) return null

  const t = word.transliteration
  const tMatch = t.match(/^y([au])(.+)u$/)
  if (!tMatch) return null
  const tv = tMatch[1]
  const tCore = tMatch[2]
  // shortened core/transliteration for the two persons where the hollow's
  // long vowel collapses before a sukūn-initial suffix (تَقُمْنَ not تَقُومْنَ)
  const shortCore = isHollow ? core.replace(coreBare[weakPositions[0]], '') : core
  const shortTCore = isHollow ? tCore.replace('ā', 'a').replace('ī', 'i').replace('ū', 'u') : tCore

  const meaningBase = word.meaning.replace(/^(he|it) /, '').replace(/s$/, '')
  const gloss = (person: string, conj: string) => `${person} ${conj}`
  const m3 = word.meaning.replace(/^(he|it) /, '') // "worships" etc, keep for he/she

  return {
    title: `Present tense (المضارع) of ${word.arabic} — every person`,
    kind: 'verb-present',
    rows: [
      { label: 'I', arabic: 'أ' + prefixVowel + core + DAMMA, transliteration: (tv === 'u' ? 'u' : 'a') + tCore + 'u', gloss: gloss('I', meaningBase) },
      { label: 'you (masc.)', arabic: 'ت' + prefixVowel + core + DAMMA, transliteration: 't' + tv + tCore + 'u', gloss: gloss('you', meaningBase) },
      { label: 'you (fem.)', arabic: 'ت' + prefixVowel + core + KASRA + 'ينَ', transliteration: 't' + tv + tCore + 'īna', gloss: gloss('you', meaningBase) },
      { label: 'he', arabic: base, transliteration: t, gloss: `he ${m3}` },
      { label: 'she', arabic: 'ت' + prefixVowel + core + DAMMA, transliteration: 't' + tv + tCore + 'u', gloss: `she ${m3}` },
      { label: 'we', arabic: 'ن' + prefixVowel + core + DAMMA, transliteration: 'n' + tv + tCore + 'u', gloss: gloss('we', meaningBase) },
      { label: 'you (masc. plural)', arabic: 'ت' + prefixVowel + core + DAMMA + 'ونَ', transliteration: 't' + tv + tCore + 'ūna', gloss: gloss('you (m. pl.)', meaningBase) },
      { label: 'you (fem. plural)', arabic: 'ت' + prefixVowel + shortCore + SUKUN + 'نَ', transliteration: 't' + tv + shortTCore + 'na', gloss: gloss('you (f. pl.)', meaningBase) },
      { label: 'they (masc.)', arabic: 'ي' + prefixVowel + core + DAMMA + 'ونَ', transliteration: 'y' + tv + tCore + 'ūna', gloss: gloss('they (m.)', meaningBase) },
      { label: 'they (fem.)', arabic: 'ي' + prefixVowel + shortCore + SUKUN + 'نَ', transliteration: 'y' + tv + shortTCore + 'na', gloss: gloss('they (f.)', meaningBase) },
    ],
  }
}

// --- near future (سَـ + present) ---------------------------------------------

const FUTURE_PERSON_GLOSS: Record<string, string> = {
  I: 'I',
  'you (masc.)': 'you',
  'you (fem.)': 'you',
  he: 'he',
  she: 'she',
  we: 'we',
  'you (masc. plural)': 'you (m. pl.)',
  'you (fem. plural)': 'you (f. pl.)',
  'they (masc.)': 'they (m.)',
  'they (fem.)': 'they (f.)',
}

/** "he worships" → "worship"; handles does/goes and drops anything after a comma */
function baseVerbMeaning(meaning: string): string {
  const m = meaning.replace(/^(he|it) /, '').split(',')[0].trim()
  const [first, ...rest] = m.split(' ')
  const de = first === 'does' ? 'do' : first === 'goes' ? 'go' : first === 'has' ? 'have' : first.endsWith('s') && !first.endsWith('ss') ? first.slice(0, -1) : first
  return [de, ...rest].join(' ')
}

/**
 * The near future is completely regular: سَـ (sa-) prefixed onto ANY present
 * indicative form. سَوْفَ (sawfa) before the verb does the same job for the
 * further future. Derived directly from the present-tense table.
 */
export function conjugateFuture(word: Word): Paradigm | null {
  const present = conjugatePresent(word)
  if (!present) return null

  const base = word.root === 'ك-و-ن' ? 'be' : baseVerbMeaning(word.meaning)
  const heRow = present.rows.find((r) => r.label === 'he')

  return {
    title: `Near future (سَـ + المضارع) of ${heRow ? 'سَ' + heRow.arabic : word.arabic} — every person`,
    kind: 'verb-future',
    rows: present.rows.map((r) => ({
      label: r.label,
      arabic: 'سَ' + r.arabic,
      transliteration: /^[aāuūiī]/.test(r.transliteration) ? `sa-${r.transliteration}` : `sa${r.transliteration}`,
      gloss: `${FUTURE_PERSON_GLOSS[r.label] ?? r.label} will ${base}`,
    })),
  }
}

// --- active participle (اسم الفاعل) -------------------------------------------

const LETTER_TO_LATIN: Record<string, string> = {
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ',
  'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y',
}

/**
 * Active participle (the "doer" noun) on the فَاعِل pattern — only generated
 * for plain Form I sound verbs, where the pattern is fully regular. Derived
 * forms (Form IV مُفْعِل like مُؤْمِن) and weak/hollow roots (قَائِل) need
 * hand-authored tables instead.
 */
export function activeParticiple(word: Word): Paradigm | null {
  const hand = HAND_AUTHORED[word.id]?.participle
  if (hand) return hand
  if (word.partOfSpeech !== 'verb' || !isPastSound(word)) return null
  if (!/^(he|it) /.test(word.meaning) || word.arabic.includes(' ')) return null

  const letters = rootLetters(word)!
  const [c1, c2, c3] = letters
  // Form I only: the bare letters of the past form must BE the root letters
  if (word.arabic.replace(/[ً-ْ]/g, '') !== letters.join('')) return null
  if (['أ', 'ء', 'ؤ', 'ئ'].includes(c2)) return null // middle hamza changes seat (سَائِل)
  const l1 = LETTER_TO_LATIN[c1]
  const l2 = LETTER_TO_LATIN[c2]
  const l3 = LETTER_TO_LATIN[c3]
  if (!l1 || !l2 || !l3) return null

  // doer meaning comes from the present-tense twin: "he worships" → "one who worships"
  const twin = words.find((w) => w.root === word.root && w !== word && /^ي/.test(w.arabic) && /^(he|it) /.test(w.meaning))
  if (!twin) return null
  const doing = twin.meaning.replace(/^(he|it) /, '').split(',')[0].trim() // "worships"
  const doingPlural = baseVerbMeaning(twin.meaning) // "worship" (handles does/goes)

  const stem = c1 + FATHA + 'ا' + c2 + KASRA + c3 // فَاعِل
  const tStem = `${l1}ā${l2}i${l3}`

  return {
    title: `Active participle (اسم الفاعل) of ${word.arabic} — ${stem} "one who ${doing}"`,
    kind: 'participle',
    rows: [
      { label: 'masc. singular', arabic: stem, transliteration: tStem, gloss: `one who ${doing} (m.)` },
      { label: 'fem. singular', arabic: stem + FATHA + 'ة', transliteration: tStem + 'ah', gloss: `one who ${doing} (f.)` },
      { label: 'masc. plural (sound)', arabic: stem + DAMMA + 'ونَ', transliteration: tStem + 'ūna', gloss: `those who ${doingPlural} (m.)` },
      { label: 'fem. plural (sound)', arabic: stem + FATHA + 'ات', transliteration: tStem + 'āt', gloss: `those who ${doingPlural} (f.)` },
    ],
  }
}

// --- imperative (command form) ----------------------------------------------

export function conjugateImperative(word: Word): Paradigm | null {
  const hand = HAND_AUTHORED[word.id]?.imperative
  if (hand) return hand
  if (word.partOfSpeech !== 'verb') return null
  const rl = rootLetters(word)
  if (rl && rl.length === 3 && rl[1] === rl[2]) return null // geminate — see conjugatePresent

  // derived from a sound يَـ present form (يَعْبُدُ); the same exclusions as
  // conjugatePresent apply, plus the core must start consonant+sukun so the
  // prosthetic-alif pattern (اُعْبُدْ / اِعْرِفْ) is valid
  const base = word.arabic
  if (!base.startsWith('ي' + FATHA)) return null
  if (!base.endsWith(DAMMA)) return null
  const core = base.slice(2, -1)
  const coreBare = core.replace(/[ً-ْ]/g, '')
  if (WEAK_LETTERS.includes(coreBare[coreBare.length - 1])) return null
  if (['أ', 'ء'].includes(coreBare[0])) return null
  if ([...coreBare].some((ch) => WEAK_LETTERS.includes(ch))) return null
  if (core[1] !== SUKUN) return null

  const t = word.transliteration
  const tMatch = t.match(/^ya(.+)u$/)
  if (!tMatch) return null
  const tCore = tMatch[1]
  // prosthetic vowel follows the stem vowel: damma stem → اُ (u), otherwise اِ (i)
  const lastVowel = tCore.match(/[aui](?=[^aui]*$)/)?.[0] ?? 'u'
  const pro = lastVowel === 'u' ? DAMMA : KASRA
  const proT = lastVowel === 'u' ? 'u' : 'i'
  const impBase = 'ا' + pro + core

  const meaningBase = word.meaning.replace(/^(he|it) /, '').replace(/s$/, '')
  const bang = meaningBase.charAt(0).toUpperCase() + meaningBase.slice(1)

  return {
    title: `Command (الأمر) of ${base} — "${bang}!"`,
    kind: 'verb-imperative',
    rows: [
      { label: 'you (masc.)', arabic: impBase + SUKUN, transliteration: proT + tCore, gloss: `${bang}! (to one man)` },
      { label: 'you (fem.)', arabic: impBase + KASRA + 'ي', transliteration: proT + tCore + 'ī', gloss: `${bang}! (to one woman)` },
      { label: 'you (masc. plural)', arabic: impBase + DAMMA + 'وا', transliteration: proT + tCore + 'ū', gloss: `${bang}! (to a group)` },
      { label: 'you (fem. plural)', arabic: impBase + SUKUN + 'نَ', transliteration: proT + tCore + 'na', gloss: `${bang}! (to a group of women)` },
    ],
  }
}

// --- nouns ------------------------------------------------------------------

function nounEligible(word: Word): boolean {
  if (word.partOfSpeech !== 'noun') return false
  if (word.id === 'ab' || word.id === 'akh') return false // أب/أخ are irregular with suffixes (أَبُوكَ، أَخُوكَ)
  // exclude entries that are already suffixed forms (دِينُكُمْ، أَبِيهِ)
  if (/\b(my|your|his|her|our|their)\b/.test(word.meaning)) return false
  // exclude words stored with a final case vowel (مِثْلُ) — the templates assume a bare stem
  if (/[ًٌٍَُِ]$/.test(word.arabic)) return false
  const bare = word.arabic.replace(/[ً-ْ]/g, '')
  if (bare.startsWith('ال')) return false // already carries ال (e.g. النَّاس)
  if (['ء', 'ا', 'ى', 'و'].includes(bare[bare.length - 1])) return false // hamza/weak endings change seats
  if (bare.endsWith('ون') || bare.endsWith('ين')) return false // sound plurals decline differently
  return true
}

/** stem with ة converted to ت (pronounced form before suffixes), plus matching transliteration stem */
function nounStems(word: Word): { stem: string; tStem: string } {
  const arabic = word.arabic
  const t = word.transliteration
  if (arabic.endsWith('ة')) {
    return { stem: arabic.slice(0, -1) + 'ت', tStem: t.endsWith('ah') ? t.slice(0, -2) + 'at' : t + 't' }
  }
  return { stem: arabic, tStem: t }
}

export function nounPossessive(word: Word): Paradigm | null {
  if (!nounEligible(word)) return null
  const { stem, tStem } = nounStems(word)
  const m = word.meaning.split(',')[0].trim()

  return {
    title: `${word.arabic} (${m}) with every possessive suffix`,
    kind: 'noun-suffix',
    rows: [
      { label: 'my', arabic: stem + KASRA + 'ي', transliteration: tStem + 'ī', gloss: `my ${m}` },
      { label: 'your (masc.)', arabic: stem + DAMMA + 'كَ', transliteration: tStem + 'uka', gloss: `your ${m}` },
      { label: 'your (fem.)', arabic: stem + DAMMA + 'كِ', transliteration: tStem + 'uki', gloss: `your ${m}` },
      { label: 'his', arabic: stem + DAMMA + 'هُ', transliteration: tStem + 'uhu', gloss: `his ${m}` },
      { label: 'her', arabic: stem + DAMMA + 'هَا', transliteration: tStem + 'uhā', gloss: `her ${m}` },
      { label: 'our', arabic: stem + DAMMA + 'نَا', transliteration: tStem + 'unā', gloss: `our ${m}` },
      { label: 'your (masc. plural)', arabic: stem + DAMMA + 'كُمْ', transliteration: tStem + 'ukum', gloss: `your (m. pl.) ${m}` },
      { label: 'your (fem. plural)', arabic: stem + DAMMA + 'كُنَّ', transliteration: tStem + 'ukunna', gloss: `your (f. pl.) ${m}` },
      { label: 'their (masc.)', arabic: stem + DAMMA + 'هُمْ', transliteration: tStem + 'uhum', gloss: `their (m.) ${m}` },
      { label: 'their (fem.)', arabic: stem + DAMMA + 'هُنَّ', transliteration: tStem + 'uhunna', gloss: `their (f.) ${m}` },
    ],
  }
}

export function nounCases(word: Word): Paradigm | null {
  if (!nounEligible(word)) return null
  const arabic = word.arabic
  const t = word.transliteration
  const m = word.meaning.split(',')[0].trim()

  const endsTa = arabic.endsWith('ة')
  const tStem = endsTa && t.endsWith('ah') ? t.slice(0, -2) + 'at' : t
  const accIndef = endsTa ? arabic + TANWIN_FATH : arabic + TANWIN_FATH + 'ا'

  const bare = arabic.replace(/[ً-ْ]/g, '')
  const firstLetter = bare[0]
  const sun = SUN_LETTERS[firstLetter]
  // sun letters assimilate: الرَّجُل (the ل is written but the next letter doubles)
  const definite = sun ? 'ال' + arabic[0] + SHADDA + arabic.slice(1) : 'الْ' + arabic
  const defT = (vowel: string) => (sun ? `a${sun}-${tStem}${vowel}` : `al-${tStem}${vowel}`)

  return {
    title: `${arabic} (${m}) through all three cases`,
    kind: 'case',
    rows: [
      { label: 'nominative, indefinite (subject)', arabic: arabic + TANWIN_DAMM, transliteration: tStem + 'un', gloss: `a ${m} (as subject)` },
      { label: 'accusative, indefinite (object)', arabic: accIndef, transliteration: tStem + 'an', gloss: `a ${m} (as object)` },
      { label: 'genitive, indefinite (after preposition)', arabic: arabic + TANWIN_KASR, transliteration: tStem + 'in', gloss: `a ${m} (after a preposition)` },
      { label: 'nominative, definite (subject)', arabic: definite + DAMMA, transliteration: defT('u'), gloss: `the ${m} (as subject)` },
      { label: 'accusative, definite (object)', arabic: definite + FATHA, transliteration: defT('a'), gloss: `the ${m} (as object)` },
      { label: 'genitive, definite (after preposition)', arabic: definite + KASRA, transliteration: defT('i'), gloss: `the ${m} (after a preposition)` },
    ],
  }
}

// --- hand-authored tables for common irregular verbs ------------------------

const HAND_AUTHORED: Record<string, { past?: Paradigm; present?: Paradigm; imperative?: Paradigm; participle?: Paradigm }> = {
  aamana: {
    participle: {
      title: 'Active participle (اسم الفاعل) of آمَنَ — مُؤْمِن "believer"',
      kind: 'participle',
      rows: [
        { label: 'masc. singular', arabic: 'مُؤْمِن', transliteration: "mu'min", gloss: 'a believer (m.) — Form IV participles use مُـ instead of فَاعِل' },
        { label: 'fem. singular', arabic: 'مُؤْمِنَة', transliteration: "mu'minah", gloss: 'a believer (f.)' },
        { label: 'masc. plural (sound)', arabic: 'مُؤْمِنُونَ', transliteration: "mu'minūna", gloss: 'believers (m.)' },
        { label: 'fem. plural (sound)', arabic: 'مُؤْمِنَات', transliteration: "mu'mināt", gloss: 'believers (f.)' },
      ],
    },
  },
  kana: {
    past: {
      title: 'Past tense (الماضي) of كَانَ (to be) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'كُنْتُ', transliteration: 'kuntu', gloss: 'I was' },
        { label: 'you (masc.)', arabic: 'كُنْتَ', transliteration: 'kunta', gloss: 'you were' },
        { label: 'you (fem.)', arabic: 'كُنْتِ', transliteration: 'kunti', gloss: 'you were' },
        { label: 'he', arabic: 'كَانَ', transliteration: 'kāna', gloss: 'he was' },
        { label: 'she', arabic: 'كَانَتْ', transliteration: 'kānat', gloss: 'she was' },
        { label: 'we', arabic: 'كُنَّا', transliteration: 'kunnā', gloss: 'we were' },
        { label: 'you (masc. plural)', arabic: 'كُنْتُمْ', transliteration: 'kuntum', gloss: 'you (m. pl.) were' },
        { label: 'you (fem. plural)', arabic: 'كُنْتُنَّ', transliteration: 'kuntunna', gloss: 'you (f. pl.) were' },
        { label: 'they (masc.)', arabic: 'كَانُوا', transliteration: 'kānū', gloss: 'they (m.) were' },
        { label: 'they (fem.)', arabic: 'كُنَّ', transliteration: 'kunna', gloss: 'they (f.) were' },
      ],
    },
    present: {
      title: 'Present tense (المضارع) of يَكُونُ (to be) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَكُونُ', transliteration: 'akūnu', gloss: 'I am/will be' },
        { label: 'you (masc.)', arabic: 'تَكُونُ', transliteration: 'takūnu', gloss: 'you are/will be' },
        { label: 'you (fem.)', arabic: 'تَكُونِينَ', transliteration: 'takūnīna', gloss: 'you are/will be' },
        { label: 'he', arabic: 'يَكُونُ', transliteration: 'yakūnu', gloss: 'he is/will be' },
        { label: 'she', arabic: 'تَكُونُ', transliteration: 'takūnu', gloss: 'she is/will be' },
        { label: 'we', arabic: 'نَكُونُ', transliteration: 'nakūnu', gloss: 'we are/will be' },
        { label: 'you (masc. plural)', arabic: 'تَكُونُونَ', transliteration: 'takūnūna', gloss: 'you (m. pl.) are/will be' },
        { label: 'you (fem. plural)', arabic: 'تَكُنَّ', transliteration: 'takunna', gloss: 'you (f. pl.) are/will be' },
        { label: 'they (masc.)', arabic: 'يَكُونُونَ', transliteration: 'yakūnūna', gloss: 'they (m.) are/will be' },
        { label: 'they (fem.)', arabic: 'يَكُنَّ', transliteration: 'yakunna', gloss: 'they (f.) are/will be' },
      ],
    },
    imperative: {
      title: 'Command (الأمر) of كَانَ — "Be!"',
      kind: 'verb-imperative',
      rows: [
        { label: 'you (masc.)', arabic: 'كُنْ', transliteration: 'kun', gloss: 'Be! (to one man)' },
        { label: 'you (fem.)', arabic: 'كُونِي', transliteration: 'kūnī', gloss: 'Be! (to one woman)' },
        { label: 'you (masc. plural)', arabic: 'كُونُوا', transliteration: 'kūnū', gloss: 'Be! (to a group)' },
        { label: 'you (fem. plural)', arabic: 'كُنَّ', transliteration: 'kunna', gloss: 'Be! (to a group of women)' },
      ],
    },
  },
  qala: {
    past: {
      title: 'Past tense (الماضي) of قَالَ (to say) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'قُلْتُ', transliteration: 'qultu', gloss: 'I said' },
        { label: 'you (masc.)', arabic: 'قُلْتَ', transliteration: 'qulta', gloss: 'you said' },
        { label: 'you (fem.)', arabic: 'قُلْتِ', transliteration: 'qulti', gloss: 'you said' },
        { label: 'he', arabic: 'قَالَ', transliteration: 'qāla', gloss: 'he said' },
        { label: 'she', arabic: 'قَالَتْ', transliteration: 'qālat', gloss: 'she said' },
        { label: 'we', arabic: 'قُلْنَا', transliteration: 'qulnā', gloss: 'we said' },
        { label: 'you (masc. plural)', arabic: 'قُلْتُمْ', transliteration: 'qultum', gloss: 'you (m. pl.) said' },
        { label: 'you (fem. plural)', arabic: 'قُلْتُنَّ', transliteration: 'qultunna', gloss: 'you (f. pl.) said' },
        { label: 'they (masc.)', arabic: 'قَالُوا', transliteration: 'qālū', gloss: 'they (m.) said' },
        { label: 'they (fem.)', arabic: 'قُلْنَ', transliteration: 'qulna', gloss: 'they (f.) said' },
      ],
    },
    imperative: {
      title: 'Command (الأمر) of قَالَ — "Say!"',
      kind: 'verb-imperative',
      rows: [
        { label: 'you (masc.)', arabic: 'قُلْ', transliteration: 'qul', gloss: 'Say! (to one man)' },
        { label: 'you (fem.)', arabic: 'قُولِي', transliteration: 'qūlī', gloss: 'Say! (to one woman)' },
        { label: 'you (masc. plural)', arabic: 'قُولُوا', transliteration: 'qūlū', gloss: 'Say! (to a group)' },
        { label: 'you (fem. plural)', arabic: 'قُلْنَ', transliteration: 'qulna', gloss: 'Say! (to a group of women)' },
      ],
    },
  },
  yaqulu: {
    present: {
      title: 'Present tense (المضارع) of يَقُولُ (to say) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَقُولُ', transliteration: 'aqūlu', gloss: 'I say' },
        { label: 'you (masc.)', arabic: 'تَقُولُ', transliteration: 'taqūlu', gloss: 'you say' },
        { label: 'you (fem.)', arabic: 'تَقُولِينَ', transliteration: 'taqūlīna', gloss: 'you say' },
        { label: 'he', arabic: 'يَقُولُ', transliteration: 'yaqūlu', gloss: 'he says' },
        { label: 'she', arabic: 'تَقُولُ', transliteration: 'taqūlu', gloss: 'she says' },
        { label: 'we', arabic: 'نَقُولُ', transliteration: 'naqūlu', gloss: 'we say' },
        { label: 'you (masc. plural)', arabic: 'تَقُولُونَ', transliteration: 'taqūlūna', gloss: 'you (m. pl.) say' },
        { label: 'you (fem. plural)', arabic: 'تَقُلْنَ', transliteration: 'taqulna', gloss: 'you (f. pl.) say' },
        { label: 'they (masc.)', arabic: 'يَقُولُونَ', transliteration: 'yaqūlūna', gloss: 'they (m.) say' },
        { label: 'they (fem.)', arabic: 'يَقُلْنَ', transliteration: 'yaqulna', gloss: 'they (f.) say' },
      ],
    },
  },
  raa: {
    past: {
      title: 'Past tense (الماضي) of رَأَى (to see) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'رَأَيْتُ', transliteration: "ra'aytu", gloss: 'I saw' },
        { label: 'you (masc.)', arabic: 'رَأَيْتَ', transliteration: "ra'ayta", gloss: 'you saw' },
        { label: 'you (fem.)', arabic: 'رَأَيْتِ', transliteration: "ra'ayti", gloss: 'you saw' },
        { label: 'he', arabic: 'رَأَى', transliteration: "ra'ā", gloss: 'he saw' },
        { label: 'she', arabic: 'رَأَتْ', transliteration: "ra'at", gloss: 'she saw' },
        { label: 'we', arabic: 'رَأَيْنَا', transliteration: "ra'aynā", gloss: 'we saw' },
        { label: 'you (masc. plural)', arabic: 'رَأَيْتُمْ', transliteration: "ra'aytum", gloss: 'you (m. pl.) saw' },
        { label: 'you (fem. plural)', arabic: 'رَأَيْتُنَّ', transliteration: "ra'aytunna", gloss: 'you (f. pl.) saw' },
        { label: 'they (masc.)', arabic: 'رَأَوْا', transliteration: "ra'aw", gloss: 'they (m.) saw' },
        { label: 'they (fem.)', arabic: 'رَأَيْنَ', transliteration: "ra'ayna", gloss: 'they (f.) saw' },
      ],
    },
  },
  yara: {
    present: {
      title: 'Present tense (المضارع) of يَرَى (to see) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَرَى', transliteration: 'arā', gloss: 'I see' },
        { label: 'you (masc.)', arabic: 'تَرَى', transliteration: 'tarā', gloss: 'you see' },
        { label: 'you (fem.)', arabic: 'تَرَيْنَ', transliteration: 'tarayna', gloss: 'you see' },
        { label: 'he', arabic: 'يَرَى', transliteration: 'yarā', gloss: 'he sees' },
        { label: 'she', arabic: 'تَرَى', transliteration: 'tarā', gloss: 'she sees' },
        { label: 'we', arabic: 'نَرَى', transliteration: 'narā', gloss: 'we see' },
        { label: 'you (masc. plural)', arabic: 'تَرَوْنَ', transliteration: 'tarawna', gloss: 'you (m. pl.) see' },
        { label: 'you (fem. plural)', arabic: 'تَرَيْنَ', transliteration: 'tarayna', gloss: 'you (f. pl.) see — written the same as you (fem. sing.)' },
        { label: 'they (masc.)', arabic: 'يَرَوْنَ', transliteration: 'yarawna', gloss: 'they (m.) see' },
        { label: 'they (fem.)', arabic: 'يَرَيْنَ', transliteration: 'yarayna', gloss: 'they (f.) see' },
      ],
    },
  },
  jaa: {
    past: {
      title: 'Past tense (الماضي) of جَاءَ (to come) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'جِئْتُ', transliteration: "ji'tu", gloss: 'I came' },
        { label: 'you (masc.)', arabic: 'جِئْتَ', transliteration: "ji'ta", gloss: 'you came' },
        { label: 'you (fem.)', arabic: 'جِئْتِ', transliteration: "ji'ti", gloss: 'you came' },
        { label: 'he', arabic: 'جَاءَ', transliteration: "jā'a", gloss: 'he came' },
        { label: 'she', arabic: 'جَاءَتْ', transliteration: "jā'at", gloss: 'she came' },
        { label: 'we', arabic: 'جِئْنَا', transliteration: "ji'nā", gloss: 'we came' },
        { label: 'you (masc. plural)', arabic: 'جِئْتُمْ', transliteration: "ji'tum", gloss: 'you (m. pl.) came' },
        { label: 'you (fem. plural)', arabic: 'جِئْتُنَّ', transliteration: "ji'tunna", gloss: 'you (f. pl.) came' },
        { label: 'they (masc.)', arabic: 'جَاؤُوا', transliteration: "jā'ū", gloss: 'they (m.) came' },
        { label: 'they (fem.)', arabic: 'جِئْنَ', transliteration: "ji'na", gloss: 'they (f.) came' },
      ],
    },
  },
  yuridu: {
    present: {
      title: 'Present tense (المضارع) of يُرِيدُ (to want) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أُرِيدُ', transliteration: 'urīdu', gloss: 'I want' },
        { label: 'you (masc.)', arabic: 'تُرِيدُ', transliteration: 'turīdu', gloss: 'you want' },
        { label: 'you (fem.)', arabic: 'تُرِيدِينَ', transliteration: 'turīdīna', gloss: 'you want' },
        { label: 'he', arabic: 'يُرِيدُ', transliteration: 'yurīdu', gloss: 'he wants' },
        { label: 'she', arabic: 'تُرِيدُ', transliteration: 'turīdu', gloss: 'she wants' },
        { label: 'we', arabic: 'نُرِيدُ', transliteration: 'nurīdu', gloss: 'we want' },
        { label: 'you (masc. plural)', arabic: 'تُرِيدُونَ', transliteration: 'turīdūna', gloss: 'you (m. pl.) want' },
        { label: 'you (fem. plural)', arabic: 'تُرِدْنَ', transliteration: 'turidna', gloss: 'you (f. pl.) want — the long ī shortens before ـنَ' },
        { label: 'they (masc.)', arabic: 'يُرِيدُونَ', transliteration: 'yurīdūna', gloss: 'they (m.) want' },
        { label: 'they (fem.)', arabic: 'يُرِدْنَ', transliteration: 'yuridna', gloss: 'they (f.) want — the long ī shortens before ـنَ' },
      ],
    },
  },
  'shaa-verb': {
    past: {
      title: "Past tense (الماضي) of شَاءَ (to will) — every person",
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'شِئْتُ', transliteration: "shi'tu", gloss: 'I willed' },
        { label: 'you (masc.)', arabic: 'شِئْتَ', transliteration: "shi'ta", gloss: 'you willed' },
        { label: 'you (fem.)', arabic: 'شِئْتِ', transliteration: "shi'ti", gloss: 'you willed' },
        { label: 'he', arabic: 'شَاءَ', transliteration: "shā'a", gloss: 'he willed' },
        { label: 'she', arabic: 'شَاءَتْ', transliteration: "shā'at", gloss: 'she willed' },
        { label: 'we', arabic: 'شِئْنَا', transliteration: "shi'nā", gloss: 'we willed' },
        { label: 'you (masc. plural)', arabic: 'شِئْتُمْ', transliteration: "shi'tum", gloss: 'you (m. pl.) willed' },
        { label: 'you (fem. plural)', arabic: 'شِئْتُنَّ', transliteration: "shi'tunna", gloss: 'you (f. pl.) willed' },
        { label: 'they (masc.)', arabic: 'شَاؤُوا', transliteration: "shā'ū", gloss: 'they (m.) willed' },
        { label: 'they (fem.)', arabic: 'شِئْنَ', transliteration: "shi'na", gloss: 'they (f.) willed' },
      ],
    },
  },
  alqa: {
    past: {
      title: 'Past tense (الماضي) of أَلْقَى (to throw/cast) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَلْقَيْتُ', transliteration: 'alqaytu', gloss: 'I threw' },
        { label: 'you (masc.)', arabic: 'أَلْقَيْتَ', transliteration: 'alqayta', gloss: 'you threw' },
        { label: 'you (fem.)', arabic: 'أَلْقَيْتِ', transliteration: 'alqayti', gloss: 'you threw' },
        { label: 'he', arabic: 'أَلْقَى', transliteration: 'alqā', gloss: 'he threw' },
        { label: 'she', arabic: 'أَلْقَتْ', transliteration: 'alqat', gloss: 'she threw' },
        { label: 'we', arabic: 'أَلْقَيْنَا', transliteration: 'alqaynā', gloss: 'we threw' },
        { label: 'you (masc. plural)', arabic: 'أَلْقَيْتُمْ', transliteration: 'alqaytum', gloss: 'you (m. pl.) threw' },
        { label: 'you (fem. plural)', arabic: 'أَلْقَيْتُنَّ', transliteration: 'alqaytunna', gloss: 'you (f. pl.) threw' },
        { label: 'they (masc.)', arabic: 'أَلْقَوْا', transliteration: 'alqaw', gloss: 'they (m.) threw' },
        { label: 'they (fem.)', arabic: 'أَلْقَيْنَ', transliteration: 'alqayna', gloss: 'they (f.) threw' },
      ],
    },
  },
  darra: {
    past: {
      title: 'Past tense (الماضي) of ضَرَّ (to harm) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'ضَرَرْتُ', transliteration: 'ḍarartu', gloss: 'I harmed — the doubled ر unpacks before consonant suffixes' },
        { label: 'you (masc.)', arabic: 'ضَرَرْتَ', transliteration: 'ḍararta', gloss: 'you harmed' },
        { label: 'you (fem.)', arabic: 'ضَرَرْتِ', transliteration: 'ḍararti', gloss: 'you harmed' },
        { label: 'he', arabic: 'ضَرَّ', transliteration: 'ḍarra', gloss: 'he harmed' },
        { label: 'she', arabic: 'ضَرَّتْ', transliteration: 'ḍarrat', gloss: 'she harmed' },
        { label: 'we', arabic: 'ضَرَرْنَا', transliteration: 'ḍararnā', gloss: 'we harmed' },
        { label: 'you (masc. plural)', arabic: 'ضَرَرْتُمْ', transliteration: 'ḍarartum', gloss: 'you (m. pl.) harmed' },
        { label: 'you (fem. plural)', arabic: 'ضَرَرْتُنَّ', transliteration: 'ḍarartunna', gloss: 'you (f. pl.) harmed' },
        { label: 'they (masc.)', arabic: 'ضَرُّوا', transliteration: 'ḍarrū', gloss: 'they (m.) harmed' },
        { label: 'they (fem.)', arabic: 'ضَرَرْنَ', transliteration: 'ḍararna', gloss: 'they (f.) harmed' },
      ],
    },
    present: {
      title: 'Present tense (المضارع) of يَضُرُّ (to harm) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَضُرُّ', transliteration: 'aḍurru', gloss: 'I harm' },
        { label: 'you (masc.)', arabic: 'تَضُرُّ', transliteration: 'taḍurru', gloss: 'you harm' },
        { label: 'you (fem.)', arabic: 'تَضُرِّينَ', transliteration: 'taḍurrīna', gloss: 'you harm' },
        { label: 'he', arabic: 'يَضُرُّ', transliteration: 'yaḍurru', gloss: 'he harms' },
        { label: 'she', arabic: 'تَضُرُّ', transliteration: 'taḍurru', gloss: 'she harms' },
        { label: 'we', arabic: 'نَضُرُّ', transliteration: 'naḍurru', gloss: 'we harm' },
        { label: 'you (masc. plural)', arabic: 'تَضُرُّونَ', transliteration: 'taḍurrūna', gloss: 'you (m. pl.) harm' },
        { label: 'you (fem. plural)', arabic: 'تَضْرُرْنَ', transliteration: 'taḍrurna', gloss: 'you (f. pl.) harm — the doubled ر unpacks before ـنَ' },
        { label: 'they (masc.)', arabic: 'يَضُرُّونَ', transliteration: 'yaḍurrūna', gloss: 'they (m.) harm' },
        { label: 'they (fem.)', arabic: 'يَضْرُرْنَ', transliteration: 'yaḍrurna', gloss: 'they (f.) harm — the doubled ر unpacks before ـنَ' },
      ],
    },
  },
  tamma: {
    past: {
      title: 'Past tense (الماضي) of تَمَّ (to be completed) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'تَمَمْتُ', transliteration: 'tamamtu', gloss: 'I was complete — the doubled م unpacks before consonant suffixes' },
        { label: 'you (masc.)', arabic: 'تَمَمْتَ', transliteration: 'tamamta', gloss: 'you were complete' },
        { label: 'you (fem.)', arabic: 'تَمَمْتِ', transliteration: 'tamamti', gloss: 'you were complete' },
        { label: 'he', arabic: 'تَمَّ', transliteration: 'tamma', gloss: 'he/it was completed' },
        { label: 'she', arabic: 'تَمَّتْ', transliteration: 'tammat', gloss: 'she/it was completed' },
        { label: 'we', arabic: 'تَمَمْنَا', transliteration: 'tamamnā', gloss: 'we were complete' },
        { label: 'you (masc. plural)', arabic: 'تَمَمْتُمْ', transliteration: 'tamamtum', gloss: 'you (m. pl.) were complete' },
        { label: 'you (fem. plural)', arabic: 'تَمَمْتُنَّ', transliteration: 'tamamtunna', gloss: 'you (f. pl.) were complete' },
        { label: 'they (masc.)', arabic: 'تَمُّوا', transliteration: 'tammū', gloss: 'they (m.) were complete' },
        { label: 'they (fem.)', arabic: 'تَمَمْنَ', transliteration: 'tamamna', gloss: 'they (f.) were complete' },
      ],
    },
  },
  wahhada: {
    present: {
      title: 'Present tense (المضارع) of يُوَحِّدُ (to declare oneness) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أُوَحِّدُ', transliteration: 'uwaḥḥidu', gloss: 'I declare the oneness (of Allah)' },
        { label: 'you (masc.)', arabic: 'تُوَحِّدُ', transliteration: 'tuwaḥḥidu', gloss: 'you declare the oneness' },
        { label: 'you (fem.)', arabic: 'تُوَحِّدِينَ', transliteration: 'tuwaḥḥidīna', gloss: 'you declare the oneness' },
        { label: 'he', arabic: 'يُوَحِّدُ', transliteration: 'yuwaḥḥidu', gloss: 'he declares the oneness' },
        { label: 'she', arabic: 'تُوَحِّدُ', transliteration: 'tuwaḥḥidu', gloss: 'she declares the oneness' },
        { label: 'we', arabic: 'نُوَحِّدُ', transliteration: 'nuwaḥḥidu', gloss: 'we declare the oneness' },
        { label: 'you (masc. plural)', arabic: 'تُوَحِّدُونَ', transliteration: 'tuwaḥḥidūna', gloss: 'you (m. pl.) declare the oneness' },
        { label: 'you (fem. plural)', arabic: 'تُوَحِّدْنَ', transliteration: 'tuwaḥḥidna', gloss: 'you (f. pl.) declare the oneness' },
        { label: 'they (masc.)', arabic: 'يُوَحِّدُونَ', transliteration: 'yuwaḥḥidūna', gloss: 'they (m.) declare the oneness' },
        { label: 'they (fem.)', arabic: 'يُوَحِّدْنَ', transliteration: 'yuwaḥḥidna', gloss: 'they (f.) declare the oneness' },
      ],
    },
  },

  // --- hollow verbs (weak middle radical) — past only; the present tense is
  // generated automatically by conjugatePresent's hollow-shortening logic. ---
  qama: {
    past: {
      title: 'Past tense (الماضي) of قَامَ (to stand, rise) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'قُمْتُ', transliteration: 'qumtu', gloss: 'I stood' },
        { label: 'you (masc.)', arabic: 'قُمْتَ', transliteration: 'qumta', gloss: 'you stood' },
        { label: 'you (fem.)', arabic: 'قُمْتِ', transliteration: 'qumti', gloss: 'you stood' },
        { label: 'he', arabic: 'قَامَ', transliteration: 'qāma', gloss: 'he stood' },
        { label: 'she', arabic: 'قَامَتْ', transliteration: 'qāmat', gloss: 'she stood' },
        { label: 'we', arabic: 'قُمْنَا', transliteration: 'qumnā', gloss: 'we stood' },
        { label: 'you (masc. plural)', arabic: 'قُمْتُمْ', transliteration: 'qumtum', gloss: 'you (m. pl.) stood' },
        { label: 'you (fem. plural)', arabic: 'قُمْتُنَّ', transliteration: 'qumtunna', gloss: 'you (f. pl.) stood' },
        { label: 'they (masc.)', arabic: 'قَامُوا', transliteration: 'qāmū', gloss: 'they (m.) stood' },
        { label: 'they (fem.)', arabic: 'قُمْنَ', transliteration: 'qumna', gloss: 'they (f.) stood' },
      ],
    },
  },
  aadaV: {
    past: {
      title: 'Past tense (الماضي) of عَادَ (to return) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'عُدْتُ', transliteration: 'udtu', gloss: 'I returned' },
        { label: 'you (masc.)', arabic: 'عُدْتَ', transliteration: 'udta', gloss: 'you returned' },
        { label: 'you (fem.)', arabic: 'عُدْتِ', transliteration: 'udti', gloss: 'you returned' },
        { label: 'he', arabic: 'عَادَ', transliteration: 'āda', gloss: 'he returned' },
        { label: 'she', arabic: 'عَادَتْ', transliteration: 'ādat', gloss: 'she returned' },
        { label: 'we', arabic: 'عُدْنَا', transliteration: 'udnā', gloss: 'we returned' },
        { label: 'you (masc. plural)', arabic: 'عُدْتُمْ', transliteration: 'udtum', gloss: 'you (m. pl.) returned' },
        { label: 'you (fem. plural)', arabic: 'عُدْتُنَّ', transliteration: 'udtunna', gloss: 'you (f. pl.) returned' },
        { label: 'they (masc.)', arabic: 'عَادُوا', transliteration: 'ādū', gloss: 'they (m.) returned' },
        { label: 'they (fem.)', arabic: 'عُدْنَ', transliteration: 'udna', gloss: 'they (f.) returned' },
      ],
    },
  },
  ghabaV: {
    past: {
      title: 'Past tense (الماضي) of غَابَ (to disappear, set) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'غِبْتُ', transliteration: 'ghibtu', gloss: 'I disappeared' },
        { label: 'you (masc.)', arabic: 'غِبْتَ', transliteration: 'ghibta', gloss: 'you disappeared' },
        { label: 'you (fem.)', arabic: 'غِبْتِ', transliteration: 'ghibti', gloss: 'you disappeared' },
        { label: 'he', arabic: 'غَابَ', transliteration: 'ghāba', gloss: 'he disappeared' },
        { label: 'she', arabic: 'غَابَتْ', transliteration: 'ghābat', gloss: 'she disappeared' },
        { label: 'we', arabic: 'غِبْنَا', transliteration: 'ghibnā', gloss: 'we disappeared' },
        { label: 'you (masc. plural)', arabic: 'غِبْتُمْ', transliteration: 'ghibtum', gloss: 'you (m. pl.) disappeared' },
        { label: 'you (fem. plural)', arabic: 'غِبْتُنَّ', transliteration: 'ghibtunna', gloss: 'you (f. pl.) disappeared' },
        { label: 'they (masc.)', arabic: 'غَابُوا', transliteration: 'ghābū', gloss: 'they (m.) disappeared' },
        { label: 'they (fem.)', arabic: 'غِبْنَ', transliteration: 'ghibna', gloss: 'they (f.) disappeared' },
      ],
    },
  },
  khafaV: {
    past: {
      title: 'Past tense (الماضي) of خَافَ (to fear) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'خِفْتُ', transliteration: 'khiftu', gloss: 'I feared' },
        { label: 'you (masc.)', arabic: 'خِفْتَ', transliteration: 'khifta', gloss: 'you feared' },
        { label: 'you (fem.)', arabic: 'خِفْتِ', transliteration: 'khifti', gloss: 'you feared' },
        { label: 'he', arabic: 'خَافَ', transliteration: 'khāfa', gloss: 'he feared' },
        { label: 'she', arabic: 'خَافَتْ', transliteration: 'khāfat', gloss: 'she feared' },
        { label: 'we', arabic: 'خِفْنَا', transliteration: 'khifnā', gloss: 'we feared' },
        { label: 'you (masc. plural)', arabic: 'خِفْتُمْ', transliteration: 'khiftum', gloss: 'you (m. pl.) feared' },
        { label: 'you (fem. plural)', arabic: 'خِفْتُنَّ', transliteration: 'khiftunna', gloss: 'you (f. pl.) feared' },
        { label: 'they (masc.)', arabic: 'خَافُوا', transliteration: 'khāfū', gloss: 'they (m.) feared' },
        { label: 'they (fem.)', arabic: 'خِفْنَ', transliteration: 'khifna', gloss: 'they (f.) feared — this verb reduces with kasra even though the present (يَخَافُ) has fatha' },
      ],
    },
  },
  saraV: {
    past: {
      title: 'Past tense (الماضي) of صَارَ (to become) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'صِرْتُ', transliteration: 'ṣirtu', gloss: 'I became' },
        { label: 'you (masc.)', arabic: 'صِرْتَ', transliteration: 'ṣirta', gloss: 'you became' },
        { label: 'you (fem.)', arabic: 'صِرْتِ', transliteration: 'ṣirti', gloss: 'you became' },
        { label: 'he', arabic: 'صَارَ', transliteration: 'ṣāra', gloss: 'he became' },
        { label: 'she', arabic: 'صَارَتْ', transliteration: 'ṣārat', gloss: 'she became' },
        { label: 'we', arabic: 'صِرْنَا', transliteration: 'ṣirnā', gloss: 'we became' },
        { label: 'you (masc. plural)', arabic: 'صِرْتُمْ', transliteration: 'ṣirtum', gloss: 'you (m. pl.) became' },
        { label: 'you (fem. plural)', arabic: 'صِرْتُنَّ', transliteration: 'ṣirtunna', gloss: 'you (f. pl.) became' },
        { label: 'they (masc.)', arabic: 'صَارُوا', transliteration: 'ṣārū', gloss: 'they (m.) became' },
        { label: 'they (fem.)', arabic: 'صِرْنَ', transliteration: 'ṣirna', gloss: 'they (f.) became' },
      ],
    },
  },
  ashaV: {
    past: {
      title: 'Past tense (الماضي) of عَاشَ (to live) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'عِشْتُ', transliteration: "'ishtu", gloss: 'I lived' },
        { label: 'you (masc.)', arabic: 'عِشْتَ', transliteration: "'ishta", gloss: 'you lived' },
        { label: 'you (fem.)', arabic: 'عِشْتِ', transliteration: "'ishti", gloss: 'you lived' },
        { label: 'he', arabic: 'عَاشَ', transliteration: "'āsha", gloss: 'he lived' },
        { label: 'she', arabic: 'عَاشَتْ', transliteration: "'āshat", gloss: 'she lived' },
        { label: 'we', arabic: 'عِشْنَا', transliteration: "'ishnā", gloss: 'we lived' },
        { label: 'you (masc. plural)', arabic: 'عِشْتُمْ', transliteration: "'ishtum", gloss: 'you (m. pl.) lived' },
        { label: 'you (fem. plural)', arabic: 'عِشْتُنَّ', transliteration: "'ishtunna", gloss: 'you (f. pl.) lived' },
        { label: 'they (masc.)', arabic: 'عَاشُوا', transliteration: "'āshū", gloss: 'they (m.) lived' },
        { label: 'they (fem.)', arabic: 'عِشْنَ', transliteration: "'ishna", gloss: 'they (f.) lived' },
      ],
    },
  },
  tafaV: {
    past: {
      title: 'Past tense (الماضي) of طَافَ (to circumambulate) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'طُفْتُ', transliteration: 'ṭuftu', gloss: 'I circumambulated' },
        { label: 'you (masc.)', arabic: 'طُفْتَ', transliteration: 'ṭufta', gloss: 'you circumambulated' },
        { label: 'you (fem.)', arabic: 'طُفْتِ', transliteration: 'ṭufti', gloss: 'you circumambulated' },
        { label: 'he', arabic: 'طَافَ', transliteration: 'ṭāfa', gloss: 'he circumambulated' },
        { label: 'she', arabic: 'طَافَتْ', transliteration: 'ṭāfat', gloss: 'she circumambulated' },
        { label: 'we', arabic: 'طُفْنَا', transliteration: 'ṭufnā', gloss: 'we circumambulated' },
        { label: 'you (masc. plural)', arabic: 'طُفْتُمْ', transliteration: 'ṭuftum', gloss: 'you (m. pl.) circumambulated' },
        { label: 'you (fem. plural)', arabic: 'طُفْتُنَّ', transliteration: 'ṭuftunna', gloss: 'you (f. pl.) circumambulated' },
        { label: 'they (masc.)', arabic: 'طَافُوا', transliteration: 'ṭāfū', gloss: 'they (m.) circumambulated' },
        { label: 'they (fem.)', arabic: 'طُفْنَ', transliteration: 'ṭufna', gloss: 'they (f.) circumambulated' },
      ],
    },
  },
  zadaV: {
    past: {
      title: 'Past tense (الماضي) of زَادَ (to increase) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'زِدْتُ', transliteration: 'zidtu', gloss: 'I increased' },
        { label: 'you (masc.)', arabic: 'زِدْتَ', transliteration: 'zidta', gloss: 'you increased' },
        { label: 'you (fem.)', arabic: 'زِدْتِ', transliteration: 'zidti', gloss: 'you increased' },
        { label: 'he', arabic: 'زَادَ', transliteration: 'zāda', gloss: 'he increased' },
        { label: 'she', arabic: 'زَادَتْ', transliteration: 'zādat', gloss: 'she increased' },
        { label: 'we', arabic: 'زِدْنَا', transliteration: 'zidnā', gloss: 'we increased' },
        { label: 'you (masc. plural)', arabic: 'زِدْتُمْ', transliteration: 'zidtum', gloss: 'you (m. pl.) increased' },
        { label: 'you (fem. plural)', arabic: 'زِدْتُنَّ', transliteration: 'zidtunna', gloss: 'you (f. pl.) increased' },
        { label: 'they (masc.)', arabic: 'زَادُوا', transliteration: 'zādū', gloss: 'they (m.) increased' },
        { label: 'they (fem.)', arabic: 'زِدْنَ', transliteration: 'zidna', gloss: 'they (f.) increased' },
      ],
    },
  },
  aqamaV: {
    past: {
      title: 'Past tense (الماضي) of أَقَامَ (to establish) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَقَمْتُ', transliteration: 'aqamtu', gloss: 'I established' },
        { label: 'you (masc.)', arabic: 'أَقَمْتَ', transliteration: 'aqamta', gloss: 'you established' },
        { label: 'you (fem.)', arabic: 'أَقَمْتِ', transliteration: 'aqamti', gloss: 'you established' },
        { label: 'he', arabic: 'أَقَامَ', transliteration: 'aqāma', gloss: 'he established' },
        { label: 'she', arabic: 'أَقَامَتْ', transliteration: 'aqāmat', gloss: 'she established' },
        { label: 'we', arabic: 'أَقَمْنَا', transliteration: 'aqamnā', gloss: 'we established' },
        { label: 'you (masc. plural)', arabic: 'أَقَمْتُمْ', transliteration: 'aqamtum', gloss: 'you (m. pl.) established' },
        { label: 'you (fem. plural)', arabic: 'أَقَمْتُنَّ', transliteration: 'aqamtunna', gloss: 'you (f. pl.) established' },
        { label: 'they (masc.)', arabic: 'أَقَامُوا', transliteration: 'aqāmū', gloss: 'they (m.) established' },
        { label: 'they (fem.)', arabic: 'أَقَمْنَ', transliteration: 'aqamna', gloss: 'they (f.) established — Form IV hollow verbs always reduce with fatha' },
      ],
    },
  },
  amataV: {
    past: {
      title: 'Past tense (الماضي) of أَمَاتَ (to cause to die) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَمَتُّ', transliteration: 'amattu', gloss: 'I caused to die — the ت of the ending merges with the root ت' },
        { label: 'you (masc.)', arabic: 'أَمَتَّ', transliteration: 'amatta', gloss: 'you caused to die' },
        { label: 'you (fem.)', arabic: 'أَمَتِّ', transliteration: 'amatti', gloss: 'you caused to die' },
        { label: 'he', arabic: 'أَمَاتَ', transliteration: 'amāta', gloss: 'he caused to die' },
        { label: 'she', arabic: 'أَمَاتَتْ', transliteration: 'amātat', gloss: 'she caused to die' },
        { label: 'we', arabic: 'أَمَتْنَا', transliteration: 'amatnā', gloss: 'we caused to die' },
        { label: 'you (masc. plural)', arabic: 'أَمَتُّمْ', transliteration: 'amattum', gloss: 'you (m. pl.) caused to die' },
        { label: 'you (fem. plural)', arabic: 'أَمَتُّنَّ', transliteration: 'amattunna', gloss: 'you (f. pl.) caused to die' },
        { label: 'they (masc.)', arabic: 'أَمَاتُوا', transliteration: 'amātū', gloss: 'they (m.) caused to die' },
        { label: 'they (fem.)', arabic: 'أَمَتْنَ', transliteration: 'amatna', gloss: 'they (f.) caused to die' },
      ],
    },
  },
  ataaIV: {
    past: {
      title: 'Past tense (الماضي) of أَطَاعَ (to obey) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَطَعْتُ', transliteration: "aṭa'tu", gloss: 'I obeyed' },
        { label: 'you (masc.)', arabic: 'أَطَعْتَ', transliteration: "aṭa'ta", gloss: 'you obeyed' },
        { label: 'you (fem.)', arabic: 'أَطَعْتِ', transliteration: "aṭa'ti", gloss: 'you obeyed' },
        { label: 'he', arabic: 'أَطَاعَ', transliteration: "aṭā'a", gloss: 'he obeyed' },
        { label: 'she', arabic: 'أَطَاعَتْ', transliteration: "aṭā'at", gloss: 'she obeyed' },
        { label: 'we', arabic: 'أَطَعْنَا', transliteration: "aṭa'nā", gloss: 'we obeyed' },
        { label: 'you (masc. plural)', arabic: 'أَطَعْتُمْ', transliteration: "aṭa'tum", gloss: 'you (m. pl.) obeyed' },
        { label: 'you (fem. plural)', arabic: 'أَطَعْتُنَّ', transliteration: "aṭa'tunna", gloss: 'you (f. pl.) obeyed' },
        { label: 'they (masc.)', arabic: 'أَطَاعُوا', transliteration: "aṭā'ū", gloss: 'they (m.) obeyed' },
        { label: 'they (fem.)', arabic: 'أَطَعْنَ', transliteration: "aṭa'na", gloss: 'they (f.) obeyed' },
      ],
    },
  },

  // --- defective verbs (weak final radical) — both tenses hand-authored,
  // since the ending pattern depends on which of three present-tense
  // classes (يَفْعِي / يَفْعُو / يَفْعَى) the verb belongs to. ---
  mashaV: {
    past: {
      title: 'Past tense (الماضي) of مَشَى (to walk) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'مَشَيْتُ', transliteration: 'mashaytu', gloss: 'I walked' },
        { label: 'you (masc.)', arabic: 'مَشَيْتَ', transliteration: 'mashayta', gloss: 'you walked' },
        { label: 'you (fem.)', arabic: 'مَشَيْتِ', transliteration: 'mashayti', gloss: 'you walked' },
        { label: 'he', arabic: 'مَشَى', transliteration: 'mashā', gloss: 'he walked' },
        { label: 'she', arabic: 'مَشَتْ', transliteration: 'mashat', gloss: 'she walked — the weak letter drops entirely' },
        { label: 'we', arabic: 'مَشَيْنَا', transliteration: 'mashaynā', gloss: 'we walked' },
        { label: 'you (masc. plural)', arabic: 'مَشَيْتُمْ', transliteration: 'mashaytum', gloss: 'you (m. pl.) walked' },
        { label: 'you (fem. plural)', arabic: 'مَشَيْتُنَّ', transliteration: 'mashaytunna', gloss: 'you (f. pl.) walked' },
        { label: 'they (masc.)', arabic: 'مَشَوْا', transliteration: 'mashaw', gloss: 'they (m.) walked' },
        { label: 'they (fem.)', arabic: 'مَشَيْنَ', transliteration: 'mashayna', gloss: 'they (f.) walked' },
      ],
    }
  },
  yamshiV: {
    present: {
      title: 'Present tense (المضارع) of يَمْشِي (to walk) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَمْشِي', transliteration: 'amshī', gloss: 'I walk' },
        { label: 'you (masc.)', arabic: 'تَمْشِي', transliteration: 'tamshī', gloss: 'you walk' },
        { label: 'you (fem.)', arabic: 'تَمْشِينَ', transliteration: 'tamshīna', gloss: 'you walk' },
        { label: 'he', arabic: 'يَمْشِي', transliteration: 'yamshī', gloss: 'he walks' },
        { label: 'she', arabic: 'تَمْشِي', transliteration: 'tamshī', gloss: 'she walks' },
        { label: 'we', arabic: 'نَمْشِي', transliteration: 'namshī', gloss: 'we walk' },
        { label: 'you (masc. plural)', arabic: 'تَمْشُونَ', transliteration: 'tamshūna', gloss: 'you (m. pl.) walk — the ي switches to و before ونَ' },
        { label: 'you (fem. plural)', arabic: 'تَمْشِينَ', transliteration: 'tamshīna', gloss: 'you (f. pl.) walk — written the same as you (fem. sing.)' },
        { label: 'they (masc.)', arabic: 'يَمْشُونَ', transliteration: 'yamshūna', gloss: 'they (m.) walk' },
        { label: 'they (fem.)', arabic: 'يَمْشِينَ', transliteration: 'yamshīna', gloss: 'they (f.) walk' },
      ],
    },
  },
  bakaV: {
    past: {
      title: 'Past tense (الماضي) of بَكَى (to cry) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'بَكَيْتُ', transliteration: 'bakaytu', gloss: 'I cried' },
        { label: 'you (masc.)', arabic: 'بَكَيْتَ', transliteration: 'bakayta', gloss: 'you cried' },
        { label: 'you (fem.)', arabic: 'بَكَيْتِ', transliteration: 'bakayti', gloss: 'you cried' },
        { label: 'he', arabic: 'بَكَى', transliteration: 'bakā', gloss: 'he cried' },
        { label: 'she', arabic: 'بَكَتْ', transliteration: 'bakat', gloss: 'she cried' },
        { label: 'we', arabic: 'بَكَيْنَا', transliteration: 'bakaynā', gloss: 'we cried' },
        { label: 'you (masc. plural)', arabic: 'بَكَيْتُمْ', transliteration: 'bakaytum', gloss: 'you (m. pl.) cried' },
        { label: 'you (fem. plural)', arabic: 'بَكَيْتُنَّ', transliteration: 'bakaytunna', gloss: 'you (f. pl.) cried' },
        { label: 'they (masc.)', arabic: 'بَكَوْا', transliteration: 'bakaw', gloss: 'they (m.) cried' },
        { label: 'they (fem.)', arabic: 'بَكَيْنَ', transliteration: 'bakayna', gloss: 'they (f.) cried' },
      ],
    }
  },
  yabkiV: {
    present: {
      title: 'Present tense (المضارع) of يَبْكِي (to cry) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَبْكِي', transliteration: 'abkī', gloss: 'I cry' },
        { label: 'you (masc.)', arabic: 'تَبْكِي', transliteration: 'tabkī', gloss: 'you cry' },
        { label: 'you (fem.)', arabic: 'تَبْكِينَ', transliteration: 'tabkīna', gloss: 'you cry' },
        { label: 'he', arabic: 'يَبْكِي', transliteration: 'yabkī', gloss: 'he cries' },
        { label: 'she', arabic: 'تَبْكِي', transliteration: 'tabkī', gloss: 'she cries' },
        { label: 'we', arabic: 'نَبْكِي', transliteration: 'nabkī', gloss: 'we cry' },
        { label: 'you (masc. plural)', arabic: 'تَبْكُونَ', transliteration: 'tabkūna', gloss: 'you (m. pl.) cry' },
        { label: 'you (fem. plural)', arabic: 'تَبْكِينَ', transliteration: 'tabkīna', gloss: 'you (f. pl.) cry' },
        { label: 'they (masc.)', arabic: 'يَبْكُونَ', transliteration: 'yabkūna', gloss: 'they (m.) cry' },
        { label: 'they (fem.)', arabic: 'يَبْكِينَ', transliteration: 'yabkīna', gloss: 'they (f.) cry' },
      ],
    },
  },
  jaraV: {
    past: {
      title: 'Past tense (الماضي) of جَرَى (to run, flow) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'جَرَيْتُ', transliteration: 'jaraytu', gloss: 'I ran' },
        { label: 'you (masc.)', arabic: 'جَرَيْتَ', transliteration: 'jarayta', gloss: 'you ran' },
        { label: 'you (fem.)', arabic: 'جَرَيْتِ', transliteration: 'jarayti', gloss: 'you ran' },
        { label: 'he', arabic: 'جَرَى', transliteration: 'jarā', gloss: 'he ran' },
        { label: 'she', arabic: 'جَرَتْ', transliteration: 'jarat', gloss: 'she ran' },
        { label: 'we', arabic: 'جَرَيْنَا', transliteration: 'jaraynā', gloss: 'we ran' },
        { label: 'you (masc. plural)', arabic: 'جَرَيْتُمْ', transliteration: 'jaraytum', gloss: 'you (m. pl.) ran' },
        { label: 'you (fem. plural)', arabic: 'جَرَيْتُنَّ', transliteration: 'jaraytunna', gloss: 'you (f. pl.) ran' },
        { label: 'they (masc.)', arabic: 'جَرَوْا', transliteration: 'jaraw', gloss: 'they (m.) ran' },
        { label: 'they (fem.)', arabic: 'جَرَيْنَ', transliteration: 'jarayna', gloss: 'they (f.) ran' },
      ],
    }
  },
  yajriV: {
    present: {
      title: 'Present tense (المضارع) of يَجْرِي (to run, flow) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَجْرِي', transliteration: 'ajrī', gloss: 'I run' },
        { label: 'you (masc.)', arabic: 'تَجْرِي', transliteration: 'tajrī', gloss: 'you run' },
        { label: 'you (fem.)', arabic: 'تَجْرِينَ', transliteration: 'tajrīna', gloss: 'you run' },
        { label: 'he', arabic: 'يَجْرِي', transliteration: 'yajrī', gloss: 'he runs' },
        { label: 'she', arabic: 'تَجْرِي', transliteration: 'tajrī', gloss: 'she runs' },
        { label: 'we', arabic: 'نَجْرِي', transliteration: 'najrī', gloss: 'we run' },
        { label: 'you (masc. plural)', arabic: 'تَجْرُونَ', transliteration: 'tajrūna', gloss: 'you (m. pl.) run' },
        { label: 'you (fem. plural)', arabic: 'تَجْرِينَ', transliteration: 'tajrīna', gloss: 'you (f. pl.) run' },
        { label: 'they (masc.)', arabic: 'يَجْرُونَ', transliteration: 'yajrūna', gloss: 'they (m.) run' },
        { label: 'they (fem.)', arabic: 'يَجْرِينَ', transliteration: 'yajrīna', gloss: 'they (f.) run' },
      ],
    },
  },
  rajaHoped: {
    past: {
      title: 'Past tense (الماضي) of رَجَا (to hope) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'رَجَوْتُ', transliteration: 'rajawtu', gloss: 'I hoped' },
        { label: 'you (masc.)', arabic: 'رَجَوْتَ', transliteration: 'rajawta', gloss: 'you hoped' },
        { label: 'you (fem.)', arabic: 'رَجَوْتِ', transliteration: 'rajawti', gloss: 'you hoped' },
        { label: 'he', arabic: 'رَجَا', transliteration: 'rajā', gloss: 'he hoped' },
        { label: 'she', arabic: 'رَجَتْ', transliteration: 'rajat', gloss: 'she hoped' },
        { label: 'we', arabic: 'رَجَوْنَا', transliteration: 'rajawnā', gloss: 'we hoped' },
        { label: 'you (masc. plural)', arabic: 'رَجَوْتُمْ', transliteration: 'rajawtum', gloss: 'you (m. pl.) hoped' },
        { label: 'you (fem. plural)', arabic: 'رَجَوْتُنَّ', transliteration: 'rajawtunna', gloss: 'you (f. pl.) hoped' },
        { label: 'they (masc.)', arabic: 'رَجَوْا', transliteration: 'rajaw', gloss: 'they (m.) hoped' },
        { label: 'they (fem.)', arabic: 'رَجَوْنَ', transliteration: 'rajawna', gloss: 'they (f.) hoped' },
      ],
    }
  },
  yarjuHopes: {
    present: {
      title: 'Present tense (المضارع) of يَرْجُو (to hope) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَرْجُو', transliteration: 'arjū', gloss: 'I hope' },
        { label: 'you (masc.)', arabic: 'تَرْجُو', transliteration: 'tarjū', gloss: 'you hope' },
        { label: 'you (fem.)', arabic: 'تَرْجِينَ', transliteration: 'tarjīna', gloss: 'you hope — و switches to ي before ينَ' },
        { label: 'he', arabic: 'يَرْجُو', transliteration: 'yarjū', gloss: 'he hopes' },
        { label: 'she', arabic: 'تَرْجُو', transliteration: 'tarjū', gloss: 'she hopes' },
        { label: 'we', arabic: 'نَرْجُو', transliteration: 'narjū', gloss: 'we hope' },
        { label: 'you (masc. plural)', arabic: 'تَرْجُونَ', transliteration: 'tarjūna', gloss: 'you (m. pl.) hope' },
        { label: 'you (fem. plural)', arabic: 'تَرْجِينَ', transliteration: 'tarjīna', gloss: 'you (f. pl.) hope' },
        { label: 'they (masc.)', arabic: 'يَرْجُونَ', transliteration: 'yarjūna', gloss: 'they (m.) hope' },
        { label: 'they (fem.)', arabic: 'يَرْجِينَ', transliteration: 'yarjīna', gloss: 'they (f.) hope' },
      ],
    },
  },
  najaSaved: {
    past: {
      title: 'Past tense (الماضي) of نَجَا (to be saved) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'نَجَوْتُ', transliteration: 'najawtu', gloss: 'I was saved' },
        { label: 'you (masc.)', arabic: 'نَجَوْتَ', transliteration: 'najawta', gloss: 'you were saved' },
        { label: 'you (fem.)', arabic: 'نَجَوْتِ', transliteration: 'najawti', gloss: 'you were saved' },
        { label: 'he', arabic: 'نَجَا', transliteration: 'najā', gloss: 'he was saved' },
        { label: 'she', arabic: 'نَجَتْ', transliteration: 'najat', gloss: 'she was saved' },
        { label: 'we', arabic: 'نَجَوْنَا', transliteration: 'najawnā', gloss: 'we were saved' },
        { label: 'you (masc. plural)', arabic: 'نَجَوْتُمْ', transliteration: 'najawtum', gloss: 'you (m. pl.) were saved' },
        { label: 'you (fem. plural)', arabic: 'نَجَوْتُنَّ', transliteration: 'najawtunna', gloss: 'you (f. pl.) were saved' },
        { label: 'they (masc.)', arabic: 'نَجَوْا', transliteration: 'najaw', gloss: 'they (m.) were saved' },
        { label: 'they (fem.)', arabic: 'نَجَوْنَ', transliteration: 'najawna', gloss: 'they (f.) were saved' },
      ],
    }
  },
  yanjuSaved: {
    present: {
      title: 'Present tense (المضارع) of يَنْجُو (to be saved) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَنْجُو', transliteration: 'anjū', gloss: 'I am saved' },
        { label: 'you (masc.)', arabic: 'تَنْجُو', transliteration: 'tanjū', gloss: 'you are saved' },
        { label: 'you (fem.)', arabic: 'تَنْجِينَ', transliteration: 'tanjīna', gloss: 'you are saved' },
        { label: 'he', arabic: 'يَنْجُو', transliteration: 'yanjū', gloss: 'he is saved' },
        { label: 'she', arabic: 'تَنْجُو', transliteration: 'tanjū', gloss: 'she is saved' },
        { label: 'we', arabic: 'نَنْجُو', transliteration: 'nanjū', gloss: 'we are saved' },
        { label: 'you (masc. plural)', arabic: 'تَنْجُونَ', transliteration: 'tanjūna', gloss: 'you (m. pl.) are saved' },
        { label: 'you (fem. plural)', arabic: 'تَنْجِينَ', transliteration: 'tanjīna', gloss: 'you (f. pl.) are saved' },
        { label: 'they (masc.)', arabic: 'يَنْجُونَ', transliteration: 'yanjūna', gloss: 'they (m.) are saved' },
        { label: 'they (fem.)', arabic: 'يَنْجِينَ', transliteration: 'yanjīna', gloss: 'they (f.) are saved' },
      ],
    },
  },
  qadaV: {
    past: {
      title: 'Past tense (الماضي) of قَضَى (to decree, fulfil) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'قَضَيْتُ', transliteration: 'qaḍaytu', gloss: 'I decreed' },
        { label: 'you (masc.)', arabic: 'قَضَيْتَ', transliteration: 'qaḍayta', gloss: 'you decreed' },
        { label: 'you (fem.)', arabic: 'قَضَيْتِ', transliteration: 'qaḍayti', gloss: 'you decreed' },
        { label: 'he', arabic: 'قَضَى', transliteration: 'qaḍā', gloss: 'he decreed' },
        { label: 'she', arabic: 'قَضَتْ', transliteration: 'qaḍat', gloss: 'she decreed' },
        { label: 'we', arabic: 'قَضَيْنَا', transliteration: 'qaḍaynā', gloss: 'we decreed' },
        { label: 'you (masc. plural)', arabic: 'قَضَيْتُمْ', transliteration: 'qaḍaytum', gloss: 'you (m. pl.) decreed' },
        { label: 'you (fem. plural)', arabic: 'قَضَيْتُنَّ', transliteration: 'qaḍaytunna', gloss: 'you (f. pl.) decreed' },
        { label: 'they (masc.)', arabic: 'قَضَوْا', transliteration: 'qaḍaw', gloss: 'they (m.) decreed' },
        { label: 'they (fem.)', arabic: 'قَضَيْنَ', transliteration: 'qaḍayna', gloss: 'they (f.) decreed' },
      ],
    }
  },
  yaqdiV: {
    present: {
      title: 'Present tense (المضارع) of يَقْضِي (to decree, fulfil) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَقْضِي', transliteration: 'aqḍī', gloss: 'I decree' },
        { label: 'you (masc.)', arabic: 'تَقْضِي', transliteration: 'taqḍī', gloss: 'you decree' },
        { label: 'you (fem.)', arabic: 'تَقْضِينَ', transliteration: 'taqḍīna', gloss: 'you decree' },
        { label: 'he', arabic: 'يَقْضِي', transliteration: 'yaqḍī', gloss: 'he decrees' },
        { label: 'she', arabic: 'تَقْضِي', transliteration: 'taqḍī', gloss: 'she decrees' },
        { label: 'we', arabic: 'نَقْضِي', transliteration: 'naqḍī', gloss: 'we decree' },
        { label: 'you (masc. plural)', arabic: 'تَقْضُونَ', transliteration: 'taqḍūna', gloss: 'you (m. pl.) decree' },
        { label: 'you (fem. plural)', arabic: 'تَقْضِينَ', transliteration: 'taqḍīna', gloss: 'you (f. pl.) decree' },
        { label: 'they (masc.)', arabic: 'يَقْضُونَ', transliteration: 'yaqḍūna', gloss: 'they (m.) decree' },
        { label: 'they (fem.)', arabic: 'يَقْضِينَ', transliteration: 'yaqḍīna', gloss: 'they (f.) decree' },
      ],
    },
  },
  saqaV: {
    past: {
      title: 'Past tense (الماضي) of سَقَى (to give water to) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'سَقَيْتُ', transliteration: 'saqaytu', gloss: 'I gave water to' },
        { label: 'you (masc.)', arabic: 'سَقَيْتَ', transliteration: 'saqayta', gloss: 'you gave water to' },
        { label: 'you (fem.)', arabic: 'سَقَيْتِ', transliteration: 'saqayti', gloss: 'you gave water to' },
        { label: 'he', arabic: 'سَقَى', transliteration: 'saqā', gloss: 'he gave water to' },
        { label: 'she', arabic: 'سَقَتْ', transliteration: 'saqat', gloss: 'she gave water to' },
        { label: 'we', arabic: 'سَقَيْنَا', transliteration: 'saqaynā', gloss: 'we gave water to' },
        { label: 'you (masc. plural)', arabic: 'سَقَيْتُمْ', transliteration: 'saqaytum', gloss: 'you (m. pl.) gave water to' },
        { label: 'you (fem. plural)', arabic: 'سَقَيْتُنَّ', transliteration: 'saqaytunna', gloss: 'you (f. pl.) gave water to' },
        { label: 'they (masc.)', arabic: 'سَقَوْا', transliteration: 'saqaw', gloss: 'they (m.) gave water to' },
        { label: 'they (fem.)', arabic: 'سَقَيْنَ', transliteration: 'saqayna', gloss: 'they (f.) gave water to' },
      ],
    }
  },
  yasqiV: {
    present: {
      title: 'Present tense (المضارع) of يَسْقِي (to give water to) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَسْقِي', transliteration: 'asqī', gloss: 'I give water to' },
        { label: 'you (masc.)', arabic: 'تَسْقِي', transliteration: 'tasqī', gloss: 'you give water to' },
        { label: 'you (fem.)', arabic: 'تَسْقِينَ', transliteration: 'tasqīna', gloss: 'you give water to' },
        { label: 'he', arabic: 'يَسْقِي', transliteration: 'yasqī', gloss: 'he gives water to' },
        { label: 'she', arabic: 'تَسْقِي', transliteration: 'tasqī', gloss: 'she gives water to' },
        { label: 'we', arabic: 'نَسْقِي', transliteration: 'nasqī', gloss: 'we give water to' },
        { label: 'you (masc. plural)', arabic: 'تَسْقُونَ', transliteration: 'tasqūna', gloss: 'you (m. pl.) give water to' },
        { label: 'you (fem. plural)', arabic: 'تَسْقِينَ', transliteration: 'tasqīna', gloss: 'you (f. pl.) give water to' },
        { label: 'they (masc.)', arabic: 'يَسْقُونَ', transliteration: 'yasqūna', gloss: 'they (m.) give water to' },
        { label: 'they (fem.)', arabic: 'يَسْقِينَ', transliteration: 'yasqīna', gloss: 'they (f.) give water to' },
      ],
    },
  },
  nadaV: {
    past: {
      title: 'Past tense (الماضي) of نَادَى (to call out) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'نَادَيْتُ', transliteration: 'nādaytu', gloss: 'I called out' },
        { label: 'you (masc.)', arabic: 'نَادَيْتَ', transliteration: 'nādayta', gloss: 'you called out' },
        { label: 'you (fem.)', arabic: 'نَادَيْتِ', transliteration: 'nādayti', gloss: 'you called out' },
        { label: 'he', arabic: 'نَادَى', transliteration: 'nādā', gloss: 'he called out' },
        { label: 'she', arabic: 'نَادَتْ', transliteration: 'nādat', gloss: 'she called out' },
        { label: 'we', arabic: 'نَادَيْنَا', transliteration: 'nādaynā', gloss: 'we called out' },
        { label: 'you (masc. plural)', arabic: 'نَادَيْتُمْ', transliteration: 'nādaytum', gloss: 'you (m. pl.) called out' },
        { label: 'you (fem. plural)', arabic: 'نَادَيْتُنَّ', transliteration: 'nādaytunna', gloss: 'you (f. pl.) called out' },
        { label: 'they (masc.)', arabic: 'نَادَوْا', transliteration: 'nādaw', gloss: 'they (m.) called out' },
        { label: 'they (fem.)', arabic: 'نَادَيْنَ', transliteration: 'nādayna', gloss: 'they (f.) called out' },
      ],
    }
  },
  yunadiV: {
    present: {
      title: 'Present tense (المضارع) of يُنَادِي (to call out) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أُنَادِي', transliteration: 'unādī', gloss: 'I call out' },
        { label: 'you (masc.)', arabic: 'تُنَادِي', transliteration: 'tunādī', gloss: 'you call out' },
        { label: 'you (fem.)', arabic: 'تُنَادِينَ', transliteration: 'tunādīna', gloss: 'you call out' },
        { label: 'he', arabic: 'يُنَادِي', transliteration: 'yunādī', gloss: 'he calls out' },
        { label: 'she', arabic: 'تُنَادِي', transliteration: 'tunādī', gloss: 'she calls out' },
        { label: 'we', arabic: 'نُنَادِي', transliteration: 'nunādī', gloss: 'we call out' },
        { label: 'you (masc. plural)', arabic: 'تُنَادُونَ', transliteration: 'tunādūna', gloss: 'you (m. pl.) call out' },
        { label: 'you (fem. plural)', arabic: 'تُنَادِينَ', transliteration: 'tunādīna', gloss: 'you (f. pl.) call out' },
        { label: 'they (masc.)', arabic: 'يُنَادُونَ', transliteration: 'yunādūna', gloss: 'they (m.) call out' },
        { label: 'they (fem.)', arabic: 'يُنَادِينَ', transliteration: 'yunādīna', gloss: 'they (f.) call out' },
      ],
    },
  },
  banaV: {
    past: {
      title: 'Past tense (الماضي) of بَنَى (to build) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'بَنَيْتُ', transliteration: 'banaytu', gloss: 'I built' },
        { label: 'you (masc.)', arabic: 'بَنَيْتَ', transliteration: 'banayta', gloss: 'you built' },
        { label: 'you (fem.)', arabic: 'بَنَيْتِ', transliteration: 'banayti', gloss: 'you built' },
        { label: 'he', arabic: 'بَنَى', transliteration: 'banā', gloss: 'he built' },
        { label: 'she', arabic: 'بَنَتْ', transliteration: 'banat', gloss: 'she built' },
        { label: 'we', arabic: 'بَنَيْنَا', transliteration: 'banaynā', gloss: 'we built' },
        { label: 'you (masc. plural)', arabic: 'بَنَيْتُمْ', transliteration: 'banaytum', gloss: 'you (m. pl.) built' },
        { label: 'you (fem. plural)', arabic: 'بَنَيْتُنَّ', transliteration: 'banaytunna', gloss: 'you (f. pl.) built' },
        { label: 'they (masc.)', arabic: 'بَنَوْا', transliteration: 'banaw', gloss: 'they (m.) built' },
        { label: 'they (fem.)', arabic: 'بَنَيْنَ', transliteration: 'banayna', gloss: 'they (f.) built' },
      ],
    }
  },
  yabniV: {
    present: {
      title: 'Present tense (المضارع) of يَبْنِي (to build) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَبْنِي', transliteration: 'abnī', gloss: 'I build' },
        { label: 'you (masc.)', arabic: 'تَبْنِي', transliteration: 'tabnī', gloss: 'you build' },
        { label: 'you (fem.)', arabic: 'تَبْنِينَ', transliteration: 'tabnīna', gloss: 'you build' },
        { label: 'he', arabic: 'يَبْنِي', transliteration: 'yabnī', gloss: 'he builds' },
        { label: 'she', arabic: 'تَبْنِي', transliteration: 'tabnī', gloss: 'she builds' },
        { label: 'we', arabic: 'نَبْنِي', transliteration: 'nabnī', gloss: 'we build' },
        { label: 'you (masc. plural)', arabic: 'تَبْنُونَ', transliteration: 'tabnūna', gloss: 'you (m. pl.) build' },
        { label: 'you (fem. plural)', arabic: 'تَبْنِينَ', transliteration: 'tabnīna', gloss: 'you (f. pl.) build' },
        { label: 'they (masc.)', arabic: 'يَبْنُونَ', transliteration: 'yabnūna', gloss: 'they (m.) build' },
        { label: 'they (fem.)', arabic: 'يَبْنِينَ', transliteration: 'yabnīna', gloss: 'they (f.) build' },
      ],
    },
  },
  ittaqaV: {
    past: {
      title: 'Past tense (الماضي) of اِتَّقَى (to fear God, be pious) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'اِتَّقَيْتُ', transliteration: 'ittaqaytu', gloss: 'I feared God' },
        { label: 'you (masc.)', arabic: 'اِتَّقَيْتَ', transliteration: 'ittaqayta', gloss: 'you feared God' },
        { label: 'you (fem.)', arabic: 'اِتَّقَيْتِ', transliteration: 'ittaqayti', gloss: 'you feared God' },
        { label: 'he', arabic: 'اِتَّقَى', transliteration: 'ittaqā', gloss: 'he feared God' },
        { label: 'she', arabic: 'اِتَّقَتْ', transliteration: 'ittaqat', gloss: 'she feared God' },
        { label: 'we', arabic: 'اِتَّقَيْنَا', transliteration: 'ittaqaynā', gloss: 'we feared God' },
        { label: 'you (masc. plural)', arabic: 'اِتَّقَيْتُمْ', transliteration: 'ittaqaytum', gloss: 'you (m. pl.) feared God' },
        { label: 'you (fem. plural)', arabic: 'اِتَّقَيْتُنَّ', transliteration: 'ittaqaytunna', gloss: 'you (f. pl.) feared God' },
        { label: 'they (masc.)', arabic: 'اِتَّقَوْا', transliteration: 'ittaqaw', gloss: 'they (m.) feared God' },
        { label: 'they (fem.)', arabic: 'اِتَّقَيْنَ', transliteration: 'ittaqayna', gloss: 'they (f.) feared God' },
      ],
    }
  },
  yattaqiV: {
    present: {
      title: 'Present tense (المضارع) of يَتَّقِي (to fear God, be pious) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَتَّقِي', transliteration: 'attaqī', gloss: 'I fear God' },
        { label: 'you (masc.)', arabic: 'تَتَّقِي', transliteration: 'tattaqī', gloss: 'you fear God' },
        { label: 'you (fem.)', arabic: 'تَتَّقِينَ', transliteration: 'tattaqīna', gloss: 'you fear God' },
        { label: 'he', arabic: 'يَتَّقِي', transliteration: 'yattaqī', gloss: 'he fears God' },
        { label: 'she', arabic: 'تَتَّقِي', transliteration: 'tattaqī', gloss: 'she fears God' },
        { label: 'we', arabic: 'نَتَّقِي', transliteration: 'nattaqī', gloss: 'we fear God' },
        { label: 'you (masc. plural)', arabic: 'تَتَّقُونَ', transliteration: 'tattaqūna', gloss: 'you (m. pl.) fear God' },
        { label: 'you (fem. plural)', arabic: 'تَتَّقِينَ', transliteration: 'tattaqīna', gloss: 'you (f. pl.) fear God' },
        { label: 'they (masc.)', arabic: 'يَتَّقُونَ', transliteration: 'yattaqūna', gloss: 'they (m.) fear God' },
        { label: 'they (fem.)', arabic: 'يَتَّقِينَ', transliteration: 'yattaqīna', gloss: 'they (f.) fear God' },
      ],
    },
  },
  aataGave: {
    past: {
      title: 'Past tense (الماضي) of أَعْطَى (to give) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَعْطَيْتُ', transliteration: "a'ṭaytu", gloss: 'I gave' },
        { label: 'you (masc.)', arabic: 'أَعْطَيْتَ', transliteration: "a'ṭayta", gloss: 'you gave' },
        { label: 'you (fem.)', arabic: 'أَعْطَيْتِ', transliteration: "a'ṭayti", gloss: 'you gave' },
        { label: 'he', arabic: 'أَعْطَى', transliteration: "a'ṭā", gloss: 'he gave' },
        { label: 'she', arabic: 'أَعْطَتْ', transliteration: "a'ṭat", gloss: 'she gave' },
        { label: 'we', arabic: 'أَعْطَيْنَا', transliteration: "a'ṭaynā", gloss: 'we gave' },
        { label: 'you (masc. plural)', arabic: 'أَعْطَيْتُمْ', transliteration: "a'ṭaytum", gloss: 'you (m. pl.) gave' },
        { label: 'you (fem. plural)', arabic: 'أَعْطَيْتُنَّ', transliteration: "a'ṭaytunna", gloss: 'you (f. pl.) gave' },
        { label: 'they (masc.)', arabic: 'أَعْطَوْا', transliteration: "a'ṭaw", gloss: 'they (m.) gave' },
        { label: 'they (fem.)', arabic: 'أَعْطَيْنَ', transliteration: "a'ṭayna", gloss: 'they (f.) gave' },
      ],
    }
  },
  yutiiGives: {
    present: {
      title: 'Present tense (المضارع) of يُعْطِي (to give) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أُعْطِي', transliteration: "u'ṭī", gloss: 'I give' },
        { label: 'you (masc.)', arabic: 'تُعْطِي', transliteration: "tu'ṭī", gloss: 'you give' },
        { label: 'you (fem.)', arabic: 'تُعْطِينَ', transliteration: "tu'ṭīna", gloss: 'you give' },
        { label: 'he', arabic: 'يُعْطِي', transliteration: "yu'ṭī", gloss: 'he gives' },
        { label: 'she', arabic: 'تُعْطِي', transliteration: "tu'ṭī", gloss: 'she gives' },
        { label: 'we', arabic: 'نُعْطِي', transliteration: "nu'ṭī", gloss: 'we give' },
        { label: 'you (masc. plural)', arabic: 'تُعْطُونَ', transliteration: "tu'ṭūna", gloss: 'you (m. pl.) give' },
        { label: 'you (fem. plural)', arabic: 'تُعْطِينَ', transliteration: "tu'ṭīna", gloss: 'you (f. pl.) give' },
        { label: 'they (masc.)', arabic: 'يُعْطُونَ', transliteration: "yu'ṭūna", gloss: 'they (m.) give' },
        { label: 'they (fem.)', arabic: 'يُعْطِينَ', transliteration: "yu'ṭīna", gloss: 'they (f.) give' },
      ],
    },
  },
  radiyaV: {
    past: {
      title: 'Past tense (الماضي) of رَضِيَ (to be pleased) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'رَضِيتُ', transliteration: 'raḍītu', gloss: 'I was pleased' },
        { label: 'you (masc.)', arabic: 'رَضِيتَ', transliteration: 'raḍīta', gloss: 'you were pleased' },
        { label: 'you (fem.)', arabic: 'رَضِيتِ', transliteration: 'raḍīti', gloss: 'you were pleased' },
        { label: 'he', arabic: 'رَضِيَ', transliteration: 'raḍiya', gloss: 'he was pleased' },
        { label: 'she', arabic: 'رَضِيَتْ', transliteration: 'raḍiyat', gloss: 'she was pleased — unlike the fatha-class, the ي stays here' },
        { label: 'we', arabic: 'رَضِينَا', transliteration: 'raḍīnā', gloss: 'we were pleased' },
        { label: 'you (masc. plural)', arabic: 'رَضِيتُمْ', transliteration: 'raḍītum', gloss: 'you (m. pl.) were pleased' },
        { label: 'you (fem. plural)', arabic: 'رَضِيتُنَّ', transliteration: 'raḍītunna', gloss: 'you (f. pl.) were pleased' },
        { label: 'they (masc.)', arabic: 'رَضُوا', transliteration: 'raḍū', gloss: 'they (m.) were pleased — the ي drops before ُوا' },
        { label: 'they (fem.)', arabic: 'رَضِينَ', transliteration: 'raḍīna', gloss: 'they (f.) were pleased' },
      ],
    }
  },
  yardaV: {
    present: {
      title: 'Present tense (المضارع) of يَرْضَى (to be pleased) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَرْضَى', transliteration: 'arḍā', gloss: 'I am pleased' },
        { label: 'you (masc.)', arabic: 'تَرْضَى', transliteration: 'tarḍā', gloss: 'you are pleased' },
        { label: 'you (fem.)', arabic: 'تَرْضَيْنَ', transliteration: 'tarḍayna', gloss: 'you are pleased' },
        { label: 'he', arabic: 'يَرْضَى', transliteration: 'yarḍā', gloss: 'he is pleased' },
        { label: 'she', arabic: 'تَرْضَى', transliteration: 'tarḍā', gloss: 'she is pleased' },
        { label: 'we', arabic: 'نَرْضَى', transliteration: 'narḍā', gloss: 'we are pleased' },
        { label: 'you (masc. plural)', arabic: 'تَرْضَوْنَ', transliteration: 'tarḍawna', gloss: 'you (m. pl.) are pleased' },
        { label: 'you (fem. plural)', arabic: 'تَرْضَيْنَ', transliteration: 'tarḍayna', gloss: 'you (f. pl.) are pleased' },
        { label: 'they (masc.)', arabic: 'يَرْضَوْنَ', transliteration: 'yarḍawna', gloss: 'they (m.) are pleased' },
        { label: 'they (fem.)', arabic: 'يَرْضَيْنَ', transliteration: 'yarḍayna', gloss: 'they (f.) are pleased' },
      ],
    },
  },
  laqiyaV: {
    past: {
      title: 'Past tense (الماضي) of لَقِيَ (to meet) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'لَقِيتُ', transliteration: 'laqītu', gloss: 'I met' },
        { label: 'you (masc.)', arabic: 'لَقِيتَ', transliteration: 'laqīta', gloss: 'you met' },
        { label: 'you (fem.)', arabic: 'لَقِيتِ', transliteration: 'laqīti', gloss: 'you met' },
        { label: 'he', arabic: 'لَقِيَ', transliteration: 'laqiya', gloss: 'he met' },
        { label: 'she', arabic: 'لَقِيَتْ', transliteration: 'laqiyat', gloss: 'she met' },
        { label: 'we', arabic: 'لَقِينَا', transliteration: 'laqīnā', gloss: 'we met' },
        { label: 'you (masc. plural)', arabic: 'لَقِيتُمْ', transliteration: 'laqītum', gloss: 'you (m. pl.) met' },
        { label: 'you (fem. plural)', arabic: 'لَقِيتُنَّ', transliteration: 'laqītunna', gloss: 'you (f. pl.) met' },
        { label: 'they (masc.)', arabic: 'لَقُوا', transliteration: 'laqū', gloss: 'they (m.) met' },
        { label: 'they (fem.)', arabic: 'لَقِينَ', transliteration: 'laqīna', gloss: 'they (f.) met' },
      ],
    }
  },
  yalqaV: {
    present: {
      title: 'Present tense (المضارع) of يَلْقَى (to meet) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَلْقَى', transliteration: 'alqā', gloss: 'I meet' },
        { label: 'you (masc.)', arabic: 'تَلْقَى', transliteration: 'talqā', gloss: 'you meet' },
        { label: 'you (fem.)', arabic: 'تَلْقَيْنَ', transliteration: 'talqayna', gloss: 'you meet' },
        { label: 'he', arabic: 'يَلْقَى', transliteration: 'yalqā', gloss: 'he meets' },
        { label: 'she', arabic: 'تَلْقَى', transliteration: 'talqā', gloss: 'she meets' },
        { label: 'we', arabic: 'نَلْقَى', transliteration: 'nalqā', gloss: 'we meet' },
        { label: 'you (masc. plural)', arabic: 'تَلْقَوْنَ', transliteration: 'talqawna', gloss: 'you (m. pl.) meet' },
        { label: 'you (fem. plural)', arabic: 'تَلْقَيْنَ', transliteration: 'talqayna', gloss: 'you (f. pl.) meet' },
        { label: 'they (masc.)', arabic: 'يَلْقَوْنَ', transliteration: 'yalqawna', gloss: 'they (m.) meet' },
        { label: 'they (fem.)', arabic: 'يَلْقَيْنَ', transliteration: 'yalqayna', gloss: 'they (f.) meet — coincidentally spelled like أَلْقَى "he threw", an unrelated verb' },
      ],
    },
  },

  // --- geminate verbs (doubled radical, r2 === r3) — the shadda unpacks
  // before consonant-initial suffixes, so both tenses are hand-authored. ---
  dallaV: {
    past: {
      title: 'Past tense (الماضي) of دَلَّ (to indicate, point) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'دَلَلْتُ', transliteration: 'dalaltu', gloss: 'I indicated' },
        { label: 'you (masc.)', arabic: 'دَلَلْتَ', transliteration: 'dalalta', gloss: 'you indicated' },
        { label: 'you (fem.)', arabic: 'دَلَلْتِ', transliteration: 'dalalti', gloss: 'you indicated' },
        { label: 'he', arabic: 'دَلَّ', transliteration: 'dalla', gloss: 'he indicated' },
        { label: 'she', arabic: 'دَلَّتْ', transliteration: 'dallat', gloss: 'she indicated' },
        { label: 'we', arabic: 'دَلَلْنَا', transliteration: 'dalalnā', gloss: 'we indicated' },
        { label: 'you (masc. plural)', arabic: 'دَلَلْتُمْ', transliteration: 'dalaltum', gloss: 'you (m. pl.) indicated' },
        { label: 'you (fem. plural)', arabic: 'دَلَلْتُنَّ', transliteration: 'dalaltunna', gloss: 'you (f. pl.) indicated' },
        { label: 'they (masc.)', arabic: 'دَلُّوا', transliteration: 'dallū', gloss: 'they (m.) indicated' },
        { label: 'they (fem.)', arabic: 'دَلَلْنَ', transliteration: 'dalalna', gloss: 'they (f.) indicated' },
      ],
    }
  },
  yadulluV: {
    present: {
      title: 'Present tense (المضارع) of يَدُلُّ (to indicate, point) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَدُلُّ', transliteration: 'adullu', gloss: 'I indicate' },
        { label: 'you (masc.)', arabic: 'تَدُلُّ', transliteration: 'tadullu', gloss: 'you indicate' },
        { label: 'you (fem.)', arabic: 'تَدُلِّينَ', transliteration: 'tadullīna', gloss: 'you indicate' },
        { label: 'he', arabic: 'يَدُلُّ', transliteration: 'yadullu', gloss: 'he indicates' },
        { label: 'she', arabic: 'تَدُلُّ', transliteration: 'tadullu', gloss: 'she indicates' },
        { label: 'we', arabic: 'نَدُلُّ', transliteration: 'nadullu', gloss: 'we indicate' },
        { label: 'you (masc. plural)', arabic: 'تَدُلُّونَ', transliteration: 'tadullūna', gloss: 'you (m. pl.) indicate' },
        { label: 'you (fem. plural)', arabic: 'تَدْلُلْنَ', transliteration: 'tadlulna', gloss: 'you (f. pl.) indicate — the doubled ل unpacks before ـنَ' },
        { label: 'they (masc.)', arabic: 'يَدُلُّونَ', transliteration: 'yadullūna', gloss: 'they (m.) indicate' },
        { label: 'they (fem.)', arabic: 'يَدْلُلْنَ', transliteration: 'yadlulna', gloss: 'they (f.) indicate — the doubled ل unpacks before ـنَ' },
      ],
    },
  },
  zannaV: {
    past: {
      title: 'Past tense (الماضي) of ظَنَّ (to think, assume) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'ظَنَنْتُ', transliteration: 'ẓanantu', gloss: 'I thought' },
        { label: 'you (masc.)', arabic: 'ظَنَنْتَ', transliteration: 'ẓananta', gloss: 'you thought' },
        { label: 'you (fem.)', arabic: 'ظَنَنْتِ', transliteration: 'ẓananti', gloss: 'you thought' },
        { label: 'he', arabic: 'ظَنَّ', transliteration: 'ẓanna', gloss: 'he thought' },
        { label: 'she', arabic: 'ظَنَّتْ', transliteration: 'ẓannat', gloss: 'she thought' },
        { label: 'we', arabic: 'ظَنَنَّا', transliteration: 'ẓanannā', gloss: 'we thought — the root ن merges with the ن of ـنَا' },
        { label: 'you (masc. plural)', arabic: 'ظَنَنْتُمْ', transliteration: 'ẓanantum', gloss: 'you (m. pl.) thought' },
        { label: 'you (fem. plural)', arabic: 'ظَنَنْتُنَّ', transliteration: 'ẓanantunna', gloss: 'you (f. pl.) thought' },
        { label: 'they (masc.)', arabic: 'ظَنُّوا', transliteration: 'ẓannū', gloss: 'they (m.) thought' },
        { label: 'they (fem.)', arabic: 'ظَنَنَّ', transliteration: 'ẓananna', gloss: 'they (f.) thought — the root ن merges with the ن of ـنَ' },
      ],
    }
  },
  yazunnuV: {
    present: {
      title: 'Present tense (المضارع) of يَظُنُّ (to think, assume) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَظُنُّ', transliteration: 'aẓunnu', gloss: 'I think' },
        { label: 'you (masc.)', arabic: 'تَظُنُّ', transliteration: 'taẓunnu', gloss: 'you think' },
        { label: 'you (fem.)', arabic: 'تَظُنِّينَ', transliteration: 'taẓunnīna', gloss: 'you think' },
        { label: 'he', arabic: 'يَظُنُّ', transliteration: 'yaẓunnu', gloss: 'he thinks' },
        { label: 'she', arabic: 'تَظُنُّ', transliteration: 'taẓunnu', gloss: 'she thinks' },
        { label: 'we', arabic: 'نَظُنُّ', transliteration: 'naẓunnu', gloss: 'we think' },
        { label: 'you (masc. plural)', arabic: 'تَظُنُّونَ', transliteration: 'taẓunnūna', gloss: 'you (m. pl.) think' },
        { label: 'you (fem. plural)', arabic: 'تَظْنُنَّ', transliteration: 'taẓnunna', gloss: 'you (f. pl.) think — the root ن merges with the ـنَ suffix' },
        { label: 'they (masc.)', arabic: 'يَظُنُّونَ', transliteration: 'yaẓunnūna', gloss: 'they (m.) think' },
        { label: 'they (fem.)', arabic: 'يَظْنُنَّ', transliteration: 'yaẓnunna', gloss: 'they (f.) think — the root ن merges with the ـنَ suffix' },
      ],
    },
  },
  raddaV: {
    past: {
      title: 'Past tense (الماضي) of رَدَّ (to reply, return) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'رَدَدْتُ', transliteration: 'radadtu', gloss: 'I replied' },
        { label: 'you (masc.)', arabic: 'رَدَدْتَ', transliteration: 'radadta', gloss: 'you replied' },
        { label: 'you (fem.)', arabic: 'رَدَدْتِ', transliteration: 'radadti', gloss: 'you replied' },
        { label: 'he', arabic: 'رَدَّ', transliteration: 'radda', gloss: 'he replied' },
        { label: 'she', arabic: 'رَدَّتْ', transliteration: 'raddat', gloss: 'she replied' },
        { label: 'we', arabic: 'رَدَدْنَا', transliteration: 'radadnā', gloss: 'we replied' },
        { label: 'you (masc. plural)', arabic: 'رَدَدْتُمْ', transliteration: 'radadtum', gloss: 'you (m. pl.) replied' },
        { label: 'you (fem. plural)', arabic: 'رَدَدْتُنَّ', transliteration: 'radadtunna', gloss: 'you (f. pl.) replied' },
        { label: 'they (masc.)', arabic: 'رَدُّوا', transliteration: 'raddū', gloss: 'they (m.) replied' },
        { label: 'they (fem.)', arabic: 'رَدَدْنَ', transliteration: 'radadna', gloss: 'they (f.) replied' },
      ],
    }
  },
  yarudduV: {
    present: {
      title: 'Present tense (المضارع) of يَرُدُّ (to reply, return) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَرُدُّ', transliteration: 'aruddu', gloss: 'I reply' },
        { label: 'you (masc.)', arabic: 'تَرُدُّ', transliteration: 'taruddu', gloss: 'you reply' },
        { label: 'you (fem.)', arabic: 'تَرُدِّينَ', transliteration: 'taruddīna', gloss: 'you reply' },
        { label: 'he', arabic: 'يَرُدُّ', transliteration: 'yaruddu', gloss: 'he replies' },
        { label: 'she', arabic: 'تَرُدُّ', transliteration: 'taruddu', gloss: 'she replies' },
        { label: 'we', arabic: 'نَرُدُّ', transliteration: 'naruddu', gloss: 'we reply' },
        { label: 'you (masc. plural)', arabic: 'تَرُدُّونَ', transliteration: 'taruddūna', gloss: 'you (m. pl.) reply' },
        { label: 'you (fem. plural)', arabic: 'تَرْدُدْنَ', transliteration: 'tardudna', gloss: 'you (f. pl.) reply — the doubled د unpacks before ـنَ' },
        { label: 'they (masc.)', arabic: 'يَرُدُّونَ', transliteration: 'yaruddūna', gloss: 'they (m.) reply' },
        { label: 'they (fem.)', arabic: 'يَرْدُدْنَ', transliteration: 'yardudna', gloss: 'they (f.) reply — the doubled د unpacks before ـنَ' },
      ],
    },
  },
  hajjaV: {
    past: {
      title: 'Past tense (الماضي) of حَجَّ (to perform hajj) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'حَجَجْتُ', transliteration: 'ḥajajtu', gloss: 'I performed hajj' },
        { label: 'you (masc.)', arabic: 'حَجَجْتَ', transliteration: 'ḥajajta', gloss: 'you performed hajj' },
        { label: 'you (fem.)', arabic: 'حَجَجْتِ', transliteration: 'ḥajajti', gloss: 'you performed hajj' },
        { label: 'he', arabic: 'حَجَّ', transliteration: 'ḥajja', gloss: 'he performed hajj' },
        { label: 'she', arabic: 'حَجَّتْ', transliteration: 'ḥajjat', gloss: 'she performed hajj' },
        { label: 'we', arabic: 'حَجَجْنَا', transliteration: 'ḥajajnā', gloss: 'we performed hajj' },
        { label: 'you (masc. plural)', arabic: 'حَجَجْتُمْ', transliteration: 'ḥajajtum', gloss: 'you (m. pl.) performed hajj' },
        { label: 'you (fem. plural)', arabic: 'حَجَجْتُنَّ', transliteration: 'ḥajajtunna', gloss: 'you (f. pl.) performed hajj' },
        { label: 'they (masc.)', arabic: 'حَجُّوا', transliteration: 'ḥajjū', gloss: 'they (m.) performed hajj' },
        { label: 'they (fem.)', arabic: 'حَجَجْنَ', transliteration: 'ḥajajna', gloss: 'they (f.) performed hajj' },
      ],
    }
  },
  yahujjuV: {
    present: {
      title: 'Present tense (المضارع) of يَحُجُّ (to perform hajj) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَحُجُّ', transliteration: 'aḥujju', gloss: 'I perform hajj' },
        { label: 'you (masc.)', arabic: 'تَحُجُّ', transliteration: 'taḥujju', gloss: 'you perform hajj' },
        { label: 'you (fem.)', arabic: 'تَحُجِّينَ', transliteration: 'taḥujjīna', gloss: 'you perform hajj' },
        { label: 'he', arabic: 'يَحُجُّ', transliteration: 'yaḥujju', gloss: 'he performs hajj' },
        { label: 'she', arabic: 'تَحُجُّ', transliteration: 'taḥujju', gloss: 'she performs hajj' },
        { label: 'we', arabic: 'نَحُجُّ', transliteration: 'naḥujju', gloss: 'we perform hajj' },
        { label: 'you (masc. plural)', arabic: 'تَحُجُّونَ', transliteration: 'taḥujjūna', gloss: 'you (m. pl.) perform hajj' },
        { label: 'you (fem. plural)', arabic: 'تَحْجُجْنَ', transliteration: 'taḥjujna', gloss: 'you (f. pl.) perform hajj — the doubled ج unpacks before ـنَ' },
        { label: 'they (masc.)', arabic: 'يَحُجُّونَ', transliteration: 'yaḥujjūna', gloss: 'they (m.) perform hajj' },
        { label: 'they (fem.)', arabic: 'يَحْجُجْنَ', transliteration: 'yaḥjujna', gloss: 'they (f.) perform hajj — the doubled ج unpacks before ـنَ' },
      ],
    },
  },
  ahabbaV: {
    past: {
      title: 'Past tense (الماضي) of أَحَبَّ (to love) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'أَحْبَبْتُ', transliteration: 'aḥbabtu', gloss: 'I loved' },
        { label: 'you (masc.)', arabic: 'أَحْبَبْتَ', transliteration: 'aḥbabta', gloss: 'you loved' },
        { label: 'you (fem.)', arabic: 'أَحْبَبْتِ', transliteration: 'aḥbabti', gloss: 'you loved' },
        { label: 'he', arabic: 'أَحَبَّ', transliteration: 'aḥabba', gloss: 'he loved' },
        { label: 'she', arabic: 'أَحَبَّتْ', transliteration: 'aḥabbat', gloss: 'she loved' },
        { label: 'we', arabic: 'أَحْبَبْنَا', transliteration: 'aḥbabnā', gloss: 'we loved' },
        { label: 'you (masc. plural)', arabic: 'أَحْبَبْتُمْ', transliteration: 'aḥbabtum', gloss: 'you (m. pl.) loved' },
        { label: 'you (fem. plural)', arabic: 'أَحْبَبْتُنَّ', transliteration: 'aḥbabtunna', gloss: 'you (f. pl.) loved' },
        { label: 'they (masc.)', arabic: 'أَحَبُّوا', transliteration: 'aḥabbū', gloss: 'they (m.) loved' },
        { label: 'they (fem.)', arabic: 'أَحْبَبْنَ', transliteration: 'aḥbabna', gloss: 'they (f.) loved' },
      ],
    }
  },
  yuhibbuV: {
    present: {
      title: 'Present tense (المضارع) of يُحِبُّ (to love) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أُحِبُّ', transliteration: 'uḥibbu', gloss: 'I love' },
        { label: 'you (masc.)', arabic: 'تُحِبُّ', transliteration: 'tuḥibbu', gloss: 'you love' },
        { label: 'you (fem.)', arabic: 'تُحِبِّينَ', transliteration: 'tuḥibbīna', gloss: 'you love' },
        { label: 'he', arabic: 'يُحِبُّ', transliteration: 'yuḥibbu', gloss: 'he loves' },
        { label: 'she', arabic: 'تُحِبُّ', transliteration: 'tuḥibbu', gloss: 'she loves' },
        { label: 'we', arabic: 'نُحِبُّ', transliteration: 'nuḥibbu', gloss: 'we love' },
        { label: 'you (masc. plural)', arabic: 'تُحِبُّونَ', transliteration: 'tuḥibbūna', gloss: 'you (m. pl.) love' },
        { label: 'you (fem. plural)', arabic: 'تُحْبِبْنَ', transliteration: 'tuḥbibna', gloss: 'you (f. pl.) love — the doubled ب unpacks before ـنَ' },
        { label: 'they (masc.)', arabic: 'يُحِبُّونَ', transliteration: 'yuḥibbūna', gloss: 'they (m.) love' },
        { label: 'they (fem.)', arabic: 'يُحْبِبْنَ', transliteration: 'yuḥbibna', gloss: 'they (f.) love — the doubled ب unpacks before ـنَ' },
      ],
    },
  },

  // --- hamza-final verb — the hamza changes seat depending on what follows ---
  qaraaV: {
    past: {
      title: 'Past tense (الماضي) of قَرَأَ (to read) — every person',
      kind: 'verb-past',
      rows: [
        { label: 'I', arabic: 'قَرَأْتُ', transliteration: "qara'tu", gloss: 'I read' },
        { label: 'you (masc.)', arabic: 'قَرَأْتَ', transliteration: "qara'ta", gloss: 'you read' },
        { label: 'you (fem.)', arabic: 'قَرَأْتِ', transliteration: "qara'ti", gloss: 'you read' },
        { label: 'he', arabic: 'قَرَأَ', transliteration: "qara'a", gloss: 'he read' },
        { label: 'she', arabic: 'قَرَأَتْ', transliteration: "qara'at", gloss: 'she read' },
        { label: 'we', arabic: 'قَرَأْنَا', transliteration: "qara'nā", gloss: 'we read' },
        { label: 'you (masc. plural)', arabic: 'قَرَأْتُمْ', transliteration: "qara'tum", gloss: 'you (m. pl.) read' },
        { label: 'you (fem. plural)', arabic: 'قَرَأْتُنَّ', transliteration: "qara'tunna", gloss: 'you (f. pl.) read' },
        { label: 'they (masc.)', arabic: 'قَرَؤُوا', transliteration: "qara'ū", gloss: 'they (m.) read — the hamza takes a وseat before و' },
        { label: 'they (fem.)', arabic: 'قَرَأْنَ', transliteration: "qara'na", gloss: 'they (f.) read' },
      ],
    }
  },
  yaqrauV: {
    present: {
      title: 'Present tense (المضارع) of يَقْرَأُ (to read) — every person',
      kind: 'verb-present',
      rows: [
        { label: 'I', arabic: 'أَقْرَأُ', transliteration: "aqra'u", gloss: 'I read' },
        { label: 'you (masc.)', arabic: 'تَقْرَأُ', transliteration: "taqra'u", gloss: 'you read' },
        { label: 'you (fem.)', arabic: 'تَقْرَئِينَ', transliteration: "taqra'īna", gloss: 'you read — the hamza takes a ي seat before ينَ' },
        { label: 'he', arabic: 'يَقْرَأُ', transliteration: "yaqra'u", gloss: 'he reads' },
        { label: 'she', arabic: 'تَقْرَأُ', transliteration: "taqra'u", gloss: 'she reads' },
        { label: 'we', arabic: 'نَقْرَأُ', transliteration: "naqra'u", gloss: 'we read' },
        { label: 'you (masc. plural)', arabic: 'تَقْرَؤُونَ', transliteration: "taqra'ūna", gloss: 'you (m. pl.) read — the hamza takes a و seat before ونَ' },
        { label: 'you (fem. plural)', arabic: 'تَقْرَأْنَ', transliteration: "taqra'na", gloss: 'you (f. pl.) read' },
        { label: 'they (masc.)', arabic: 'يَقْرَؤُونَ', transliteration: "yaqra'ūna", gloss: 'they (m.) read' },
        { label: 'they (fem.)', arabic: 'يَقْرَأْنَ', transliteration: "yaqra'na", gloss: 'they (f.) read' },
      ],
    },
  },
}

// --- combined verb view (past + present side by side) -----------------------

export interface VerbPair {
  /** the shared root, used as the selection key */
  id: string
  /** e.g. "عَبَدَ / يَعْبُدُ" */
  arabicLabel: string
  meaning: string
  past: Paradigm | null
  present: Paradigm | null
  imperative: Paradigm | null
}

/** fixed person order shared by every verb table, for aligning past/present rows */
export const PERSON_ORDER = [
  'I',
  'you (masc.)',
  'you (fem.)',
  'he',
  'she',
  'we',
  'you (masc. plural)',
  'you (fem. plural)',
  'they (masc.)',
  'they (fem.)',
] as const

/** Verbs grouped by root, pairing the past-tense entry with its present-tense twin where both exist. */
export function getVerbPairs(): VerbPair[] {
  const byRoot = new Map<string, Word[]>()
  for (const w of words) {
    if (w.partOfSpeech !== 'verb' || !w.root) continue
    const list = byRoot.get(w.root) ?? []
    list.push(w)
    byRoot.set(w.root, list)
  }

  const pairs: VerbPair[] = []
  for (const [root, group] of byRoot) {
    let past: Paradigm | null = null
    let present: Paradigm | null = null
    let imperative: Paradigm | null = null
    let sourceWord: Word | undefined
    for (const w of group) {
      if (!past) {
        past = conjugatePast(w)
        if (past) sourceWord = sourceWord ?? w
      }
      if (!present) {
        present = conjugatePresent(w)
        if (present) sourceWord = sourceWord ?? w
      }
      if (!imperative) imperative = conjugateImperative(w)
    }
    if ((!past && !present) || !sourceWord) continue
    const pastHe = past?.rows.find((r) => r.label === 'he')?.arabic
    const presentHe = present?.rows.find((r) => r.label === 'he')?.arabic
    pairs.push({
      id: root,
      arabicLabel: [pastHe, presentHe].filter(Boolean).join(' / '),
      meaning: sourceWord.meaning,
      past,
      present,
      imperative,
    })
  }
  return pairs
}

// --- catalog for the explorer UI --------------------------------------------

export type ExplorerCategory =
  | 'past-verbs'
  | 'present-verbs'
  | 'future-verbs'
  | 'imperative-verbs'
  | 'participles'
  | 'noun-possessive'
  | 'noun-cases'

export const CATEGORY_LABELS: Record<ExplorerCategory, string> = {
  'past-verbs': 'Past tense verbs (الماضي)',
  'present-verbs': 'Present tense verbs (المضارع)',
  'future-verbs': 'Near future (سَـ + المضارع)',
  'imperative-verbs': 'Command form (الأمر)',
  participles: 'Active participles (اسم الفاعل)',
  'noun-possessive': 'Nouns — possessive suffixes',
  'noun-cases': 'Nouns — case endings',
}

export function getTable(category: ExplorerCategory, word: Word): Paradigm | null {
  switch (category) {
    case 'past-verbs':
      return conjugatePast(word)
    case 'present-verbs':
      return conjugatePresent(word)
    case 'future-verbs':
      return conjugateFuture(word)
    case 'imperative-verbs':
      return conjugateImperative(word)
    case 'participles':
      return activeParticiple(word)
    case 'noun-possessive':
      return nounPossessive(word)
    case 'noun-cases':
      return nounCases(word)
  }
}

/** All words that have a reliable table in the given category. */
export function getEligibleWords(category: ExplorerCategory): Word[] {
  return words.filter((w) => getTable(category, w) !== null)
}
