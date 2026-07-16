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

  const base = word.arabic
  // must be a present-tense "he" form: يَـ or يُـ prefix, indicative -u ending
  if (!(base.startsWith('ي' + FATHA) || base.startsWith('ي' + DAMMA))) return null
  if (!base.endsWith(DAMMA)) return null

  const prefixVowel = base[1]
  const core = base.slice(2, -1) // يَعْبُدُ -> عْبُد

  // defective (ends in a weak letter) or hamza-initial cores break concatenation,
  // and hollow cores (long vowel inside, e.g. يُرِيدُ) shorten in the feminine
  // plural (يُرِدْنَ) — all of these need a hand-authored table instead
  const coreBare = core.replace(/[ً-ْ]/g, '')
  if (WEAK_LETTERS.includes(coreBare[coreBare.length - 1])) return null
  if (['أ', 'ء'].includes(coreBare[0])) return null
  if ([...coreBare].some((ch) => WEAK_LETTERS.includes(ch))) return null

  const t = word.transliteration
  const tMatch = t.match(/^y([au])(.+)u$/)
  if (!tMatch) return null
  const tv = tMatch[1]
  const tCore = tMatch[2]

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
      { label: 'you (fem. plural)', arabic: 'ت' + prefixVowel + core + SUKUN + 'نَ', transliteration: 't' + tv + tCore + 'na', gloss: gloss('you (f. pl.)', meaningBase) },
      { label: 'they (masc.)', arabic: 'ي' + prefixVowel + core + DAMMA + 'ونَ', transliteration: 'y' + tv + tCore + 'ūna', gloss: gloss('they (m.)', meaningBase) },
      { label: 'they (fem.)', arabic: 'ي' + prefixVowel + core + SUKUN + 'نَ', transliteration: 'y' + tv + tCore + 'na', gloss: gloss('they (f.)', meaningBase) },
    ],
  }
}

// --- imperative (command form) ----------------------------------------------

export function conjugateImperative(word: Word): Paradigm | null {
  const hand = HAND_AUTHORED[word.id]?.imperative
  if (hand) return hand
  if (word.partOfSpeech !== 'verb') return null

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
  if (word.id === 'ab') return false // أب is irregular with suffixes (أَبُوكَ، أَبِيهِ)
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

const HAND_AUTHORED: Record<string, { past?: Paradigm; present?: Paradigm; imperative?: Paradigm }> = {
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

export type ExplorerCategory = 'past-verbs' | 'present-verbs' | 'imperative-verbs' | 'noun-possessive' | 'noun-cases'

export const CATEGORY_LABELS: Record<ExplorerCategory, string> = {
  'past-verbs': 'Past tense verbs (الماضي)',
  'present-verbs': 'Present tense verbs (المضارع)',
  'imperative-verbs': 'Command form (الأمر)',
  'noun-possessive': 'Nouns — possessive suffixes',
  'noun-cases': 'Nouns — case endings',
}

export function getTable(category: ExplorerCategory, word: Word): Paradigm | null {
  switch (category) {
    case 'past-verbs':
      return conjugatePast(word)
    case 'present-verbs':
      return conjugatePresent(word)
    case 'imperative-verbs':
      return conjugateImperative(word)
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
