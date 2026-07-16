import type { GrammarConcept } from '../types'

export const grammarConcepts: GrammarConcept[] = [
  {
    id: 'definite-article',
    title: 'The Definite Article ال (al-)',
    summary: 'Attach ال to the front of a noun to make it "the ___" instead of "a ___".',
    explanation:
      'Arabic has no separate word for "a/an" — a bare noun like رَجُل (rajul) already means "a man". To say "the man", you attach the prefix ال (al-) directly onto the front of the word: الرَّجُل (ar-rajul), "the man".\n\n' +
      'A small detail for reading aloud: when ال comes before a "sun letter" (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), the ل is not pronounced — instead the following letter doubles. That is why رَجُل + ال is written الرَّجُل but pronounced ar-rajul, not al-rajul. The spelling never changes, only the pronunciation.',
    examples: [
      { arabic: 'رَجُلٌ', transliteration: 'rajulun', gloss: 'a man' },
      { arabic: 'الرَّجُلُ', transliteration: 'ar-rajulu', gloss: 'the man' },
      { arabic: 'بَيْتٌ', transliteration: 'baytun', gloss: 'a house' },
      { arabic: 'الْبَيْتُ', transliteration: 'al-baytu', gloss: 'the house' },
    ],
    paradigms: [
      {
        title: 'رَجُل (man) — indefinite vs. definite',
        rows: [
          { label: 'indefinite', arabic: 'رَجُلٌ', transliteration: 'rajulun', gloss: 'a man' },
          { label: 'definite (+ال)', arabic: 'الرَّجُلُ', transliteration: 'ar-rajulu', gloss: 'the man' },
        ],
      },
    ],
  },
  {
    id: 'demonstratives',
    title: 'Demonstratives: this / that / these',
    summary: 'هَذَا and هَذِهِ change for gender; ذَلِكَ/تِلْكَ point to something farther away.',
    explanation:
      'Arabic demonstrative words agree with the gender (and number) of the noun they point to, the same way an adjective does.\n\n' +
      'هَذَا (hādhā) "this" — masculine singular. هَذِهِ (hādhihi) "this" — feminine singular. هَؤُلَاءِ (hā\'ulā\'i) "these" is used for both masculine and feminine plural people.\n\n' +
      'For something farther away ("that" instead of "this"), Arabic switches to a different word rather than adding a word like English "over there": ذَلِكَ (dhālika) "that" (masc.), تِلْكَ (tilka) "that" (fem.).\n\n' +
      'A demonstrative can stand right before a DEFINITE noun as a full phrase (هَذَا الرَّجُلُ "this man"), or it can be the subject of its own sentence with an INDEFINITE noun (هَذَا رَجُلٌ "this is a man") — those two look almost identical but mean different things, so definiteness is the whole signal. Watch closely: dropping ال from الرَّجُلُ in the phrase version instantly turns "this man" into the sentence "this is a man".',
    examples: [
      { arabic: 'هَذَا رَجُلٌ', transliteration: 'hādhā rajulun', gloss: 'this is a man (masc.) — sentence, indefinite' },
      { arabic: 'هَذَا الرَّجُلُ', transliteration: 'hādhā r-rajulu', gloss: 'this man (masc.) — phrase, definite' },
      { arabic: 'تِلْكَ الْعِبَادَةُ', transliteration: 'tilka l-\'ibādatu', gloss: 'that worship (fem., farther away, phrase)' },
      { arabic: 'هَؤُلَاءِ النَّاسُ', transliteration: "hā'ulā'i n-nāsu", gloss: 'these people (phrase)' },
    ],
    paradigms: [
      {
        title: 'As a SENTENCE — "this/that is a ___" (noun stays indefinite)',
        rows: [
          { label: 'this is (masc., near)', arabic: 'هَذَا رَجُلٌ', transliteration: 'hādhā rajulun', gloss: 'this is a man' },
          { label: 'this is (fem., near)', arabic: 'هَذِهِ قَرْيَةٌ', transliteration: 'hādhihi qaryatun', gloss: 'this is a village' },
          { label: 'that is (masc., far)', arabic: 'ذَلِكَ رَجُلٌ', transliteration: 'dhālika rajulun', gloss: 'that is a man' },
          { label: 'that is (fem., far)', arabic: 'تِلْكَ قَرْيَةٌ', transliteration: 'tilka qaryatun', gloss: 'that is a village' },
        ],
      },
      {
        title: 'As a PHRASE — "this/that ___" (noun becomes definite with ال)',
        rows: [
          { label: 'this ___ (masc., near)', arabic: 'هَذَا الرَّجُلُ', transliteration: 'hādhā r-rajulu', gloss: 'this man' },
          { label: 'this ___ (fem., near)', arabic: 'هَذِهِ الْقَرْيَةُ', transliteration: 'hādhihi l-qaryatu', gloss: 'this village' },
          { label: 'that ___ (masc., far)', arabic: 'ذَلِكَ الرَّجُلُ', transliteration: 'dhālika r-rajulu', gloss: 'that man' },
          { label: 'that ___ (fem., far)', arabic: 'تِلْكَ الْقَرْيَةُ', transliteration: 'tilka l-qaryatu', gloss: 'that village' },
          { label: 'these ___ (plural)', arabic: 'هَؤُلَاءِ النَّاسُ', transliteration: "hā'ulā'i n-nāsu", gloss: 'these people' },
        ],
      },
    ],
  },
  {
    id: 'adjective-agreement',
    title: 'Noun–Adjective Agreement (Naʿt)',
    summary: 'An adjective must match its noun in definiteness — both get ال, or neither does.',
    explanation:
      'In English, "the" only sits in front of the noun: "the big man". In Arabic, if the noun is definite, the adjective describing it must ALSO carry ال — you cannot leave the adjective indefinite.\n\n' +
      'رَجُلٌ كَبِيرٌ (rajulun kabīrun) = "a big man" — both words indefinite.\n' +
      'الرَّجُلُ الْكَبِيرُ (ar-rajulu l-kabīru) = "the big man" — both words definite.\n\n' +
      'Mixing them (ال on the noun but not the adjective) does not mean "the big man" — it actually flips the sentence into a different structure entirely (a full sentence: "the man is big"). So for a simple descriptive phrase, definiteness must match on both words. Adjectives also follow the noun (not before it, as in English), and agree in gender: feminine nouns usually take an adjective ending in ة.',
    examples: [
      { arabic: 'رَجُلٌ كَبِيرٌ', transliteration: 'rajulun kabīrun', gloss: 'a big man (both indefinite)' },
      { arabic: 'الرَّجُلُ الْكَبِيرُ', transliteration: 'ar-rajulu l-kabīru', gloss: 'the big man (both definite)' },
      { arabic: 'جَنَّةٌ كَبِيرَةٌ', transliteration: 'jannatun kabīratun', gloss: 'a big garden (feminine agreement: -atun)' },
    ],
    paradigms: [
      {
        title: 'رَجُل / قَرْيَة (man / village) + كَبِير (big), every combination',
        rows: [
          { label: 'masc., indefinite', arabic: 'رَجُلٌ كَبِيرٌ', transliteration: 'rajulun kabīrun', gloss: 'a big man' },
          { label: 'masc., definite', arabic: 'الرَّجُلُ الْكَبِيرُ', transliteration: 'ar-rajulu l-kabīru', gloss: 'the big man' },
          { label: 'fem., indefinite', arabic: 'قَرْيَةٌ كَبِيرَةٌ', transliteration: 'qaryatun kabīratun', gloss: 'a big village' },
          { label: 'fem., definite', arabic: 'الْقَرْيَةُ الْكَبِيرَةُ', transliteration: 'al-qaryatu l-kabīratu', gloss: 'the big village' },
        ],
      },
    ],
  },
  {
    id: 'case-endings',
    title: 'Case Endings (Iʿrāb): -u / -a / -i',
    summary: 'A noun\'s final short vowel changes to show its grammatical role in the sentence.',
    explanation:
      'Arabic marks a noun\'s job in the sentence with a short vowel on its last letter, called iʿrāb. There are three cases:\n\n' +
      '• Nominative (rafʿ) — ending -u, or -un if indefinite. Used for the SUBJECT of a sentence.\n' +
      '• Accusative (naṣb) — ending -a, or -an if indefinite. Used for the DIRECT OBJECT of a verb.\n' +
      '• Genitive (jarr) — ending -i, or -in if indefinite. Used after a PREPOSITION (like فِي، مِنْ، عَلَى) or as the second part of a possessive pair.\n\n' +
      'The extra -n sound on indefinite nouns (-un, -an, -in) is called tanwīn (nunation) — it disappears once the noun becomes definite with ال. Compare: رَجُلٌ (rajulun, a man, subject) → الرَّجُلُ (ar-rajulu, the man, subject) — same case, but the ن sound drops once ال is added.',
    examples: [
      { arabic: 'جَاءَ الرَّجُلُ', transliteration: 'jā’a r-rajulu', gloss: 'The man came (رجل is the subject → -u)' },
      { arabic: 'رَأَيْتُ الرَّجُلَ', transliteration: 'ra’aytu r-rajula', gloss: 'I saw the man (رجل is the object → -a)' },
      { arabic: 'فِي الْبَيْتِ', transliteration: 'fī l-bayti', gloss: 'in the house (بيت follows a preposition → -i)' },
      { arabic: 'كِتَابٌ', transliteration: 'kitābun', gloss: 'a book, indefinite subject (-un with tanwīn)' },
    ],
    paradigms: [
      {
        title: 'رَجُل (man) through all three cases',
        kind: 'case',
        rows: [
          { label: 'nominative, indefinite (subject)', arabic: 'رَجُلٌ', transliteration: 'rajulun', gloss: 'a man (as subject)' },
          { label: 'accusative, indefinite (object)', arabic: 'رَجُلًا', transliteration: 'rajulan', gloss: 'a man (as object)' },
          { label: 'genitive, indefinite (after preposition)', arabic: 'رَجُلٍ', transliteration: 'rajulin', gloss: 'a man (after a preposition)' },
          { label: 'nominative, definite (subject)', arabic: 'الرَّجُلُ', transliteration: 'ar-rajulu', gloss: 'the man (as subject)' },
          { label: 'accusative, definite (object)', arabic: 'الرَّجُلَ', transliteration: 'ar-rajula', gloss: 'the man (as object)' },
          { label: 'genitive, definite (after preposition)', arabic: 'الرَّجُلِ', transliteration: 'ar-rajuli', gloss: 'the man (after a preposition)' },
        ],
      },
    ],
  },
  {
    id: 'negation',
    title: 'Negation: لا / ما / لم / لن / ليس',
    summary: 'Arabic uses a different negating particle depending on the tense and sentence type being negated.',
    explanation:
      'English just adds "not" almost anywhere. Arabic instead picks a specific particle for the job:\n\n' +
      '• لَا (lā) — negates a present-tense verb, or general/habitual statements: لَا أَعْبُدُ "I do not worship".\n' +
      '• مَا (mā) — negates a past-tense verb (like "did not"), often in plain narration: مَا كَانَ مِنَ الْمُشْرِكِينَ "he was not one of the polytheists".\n' +
      '• لَمْ (lam) — also negates the past, but grammatically it pairs with the PRESENT-tense verb form (put into the jussive mood) to express a completed negation: لَمْ يَعْبُدْ "he did not worship".\n' +
      '• لَنْ (lan) — negates the FUTURE, and pairs with the present-tense verb in the subjunctive mood: لَنْ يَتْرُكَ "he will never leave".\n' +
      '• لَيْسَ (laysa) — negates a nominal (verb-less) sentence, working like "is not": لَيْسَ الصَّنَمُ إِلَٰهًا "the idol is not a god".\n\n' +
      'You do not need to master every mood ending yet — for now, recognise which particle signals which kind of negation.',
    examples: [
      { arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', transliteration: "lā a'budu mā ta'budūna", gloss: 'I do not worship what you worship' },
      { arabic: 'لَمْ يَعْبُدْ إِبْرَاهِيمُ الْأَصْنَامَ', transliteration: "lam ya'bud ibrāhīmu l-aṣnāma", gloss: 'Ibrahim did not worship the idols' },
      { arabic: 'لَنْ يَتْرُكَ إِبْرَاهِيمُ النَّاسَ', transliteration: 'lan yatruka ibrāhīmu n-nāsa', gloss: 'Ibrahim will never leave the people' },
      { arabic: 'لَيْسَ الصَّنَمُ إِلَٰهًا', transliteration: 'laysa ṣ-ṣanamu ilāhan', gloss: 'the idol is not a god' },
    ],
    paradigms: [
      {
        title: '"I worship" (root ع-ب-د), negated five ways',
        rows: [
          { label: 'لَا + present (general/habitual)', arabic: 'لَا أَعْبُدُ', transliteration: "lā a'budu", gloss: 'I do not worship' },
          { label: 'مَا + past (plain narration)', arabic: 'مَا عَبَدْتُ', transliteration: "mā 'abadtu", gloss: 'I did not worship' },
          { label: 'لَمْ + jussive (completed past)', arabic: 'لَمْ أَعْبُدْ', transliteration: "lam a'bud", gloss: 'I did not worship' },
          { label: 'لَنْ + subjunctive (future)', arabic: 'لَنْ أَعْبُدَ', transliteration: "lan a'buda", gloss: 'I will never worship' },
          { label: 'لَيْسَ (nominal sentence)', arabic: 'لَسْتُ عَابِدًا', transliteration: 'lastu \'ābidan', gloss: 'I am not a worshipper' },
        ],
      },
    ],
    contextDecks: [
      {
        title: 'لَا in context — real sentences from the stories',
        rows: [
          { label: 'example 1', arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', transliteration: "lā a'budu mā ta'budūna", gloss: 'I do not worship what you worship' },
          { label: 'example 2', arabic: 'وَالْحِجَارَةُ لَا تَنْفَعُ شَيْئًا', transliteration: "wa l-ḥijāratu lā tanfa'u shay'an", gloss: 'and stones do not benefit anything' },
          { label: 'example 3', arabic: 'حِجَارَةٌ لَا تَنْطِقُ وَلَا تَسْمَعُ', transliteration: 'ḥijāratun lā tanṭiqu wa lā tasma\'u', gloss: 'stones that do not speak and do not hear' },
        ],
      },
      {
        title: 'مَا in context — real sentences from the stories',
        rows: [
          { label: 'example 1', arabic: 'وَمَا كَانَ إِبْرَاهِيمُ مِنَ الْمُشْرِكِينَ', transliteration: 'wa mā kāna Ibrāhīmu mina l-mushrikīna', gloss: 'and Ibrahim was not among the polytheists' },
          { label: 'example 2', arabic: 'لَكِنَّ النَّاسَ مَا سَمِعُوا مِنْهُ', transliteration: 'lākinna n-nāsa mā sami\'ū minhu', gloss: 'but the people did not listen to him' },
        ],
      },
      {
        title: 'لَمْ in context — real sentences from the stories',
        rows: [
          { label: 'example 1', arabic: 'لَمْ يَعْبُدْ إِبْرَاهِيمُ الْأَصْنَامَ', transliteration: "lam ya'bud Ibrāhīmu l-aṣnāma", gloss: 'Ibrahim did not worship the idols' },
          { label: 'example 2', arabic: 'وَلَمْ يَتْرُكْ دِينَ التَّوْحِيدِ', transliteration: 'wa lam yatruk dīna t-tawḥīdi', gloss: 'and he did not leave the religion of Tawhid' },
          { label: 'example 3', arabic: 'عَرَفُوا الْحَقَّ وَلَمْ يَقْبَلُوهُ', transliteration: "'arafū l-ḥaqqa wa lam yaqbalūhu", gloss: 'they knew the truth but did not accept it' },
        ],
      },
      {
        title: 'لَنْ in context — real sentences from the stories',
        rows: [
          { label: 'example 1', arabic: 'وَلَنْ يَتْرُكَ إِبْرَاهِيمُ النَّاسَ', transliteration: 'wa lan yatruka Ibrāhīmu n-nāsa', gloss: 'and Ibrahim will never leave the people' },
          { label: 'example 2', arabic: 'وَلَنْ يَخْرُجَ مِنْهَا أَبَدًا', transliteration: 'wa lan yakhruja minhā abadan', gloss: 'and he will never leave it' },
        ],
      },
      {
        title: 'لَيْسَ in context — real sentences from the stories',
        rows: [
          { label: 'example 1', arabic: 'لَيْسَ الصَّنَمُ إِلَٰهًا', transliteration: 'laysa ṣ-ṣanamu ilāhan', gloss: 'the idol is not a god' },
          { label: 'example 2', arabic: 'لَيْسَ فَوْقَهُ أَثَرٌ مِنَ النَّارِ', transliteration: 'laysa fawqahu atharun mina n-nāri', gloss: 'there was no trace of the fire above him' },
        ],
      },
    ],
  },
  {
    id: 'possessive-suffixes',
    title: 'Possessive Suffixes on Nouns',
    summary: 'Attach a short pronoun ending directly onto a noun to say "my/your/his/her/our/their ___".',
    explanation:
      'Arabic does not use a separate word like English "my" or "his". Instead, a small pronoun suffix attaches straight onto the end of the noun.\n\n' +
      'ـِي (-ī) "my", ـكَ (-ka) "your (m.)", ـكِ (-ki) "your (f.)", ـهُ (-hu) "his", ـهَا (-hā) "her", ـنَا (-nā) "our", ـكُمْ (-kum) "your (m. pl.)", ـكُنَّ (-kunna) "your (f. pl.)", ـهُمْ (-hum) "their (m.)", ـهُنَّ (-hunna) "their (f.)". As with verbs, the masculine plural forms cover mixed groups; the feminine plurals are used for all-female groups only.\n\n' +
      'One pronunciation note: after a kasra (-i sound), ـهُ (-hu) is pronounced ـهِ (-hi) instead — so فِي بَيْتِهِ is "fī baytihi" (in his house), not "baytihu". The spelling of the suffix itself doesn\'t change, just the vowel of ـهُ.',
    examples: [
      { arabic: 'كِتَابِي', transliteration: 'kitābī', gloss: 'my book' },
      { arabic: 'بَيْتُهَا', transliteration: 'baytuhā', gloss: 'her house' },
      { arabic: 'رَبُّنَا', transliteration: 'rabbunā', gloss: 'our Lord' },
      { arabic: 'رَبُّكُمْ', transliteration: 'rabbukum', gloss: 'your (pl.) Lord' },
    ],
    paradigms: [
      {
        title: 'رَبّ (Lord) with every possessive suffix',
        kind: 'noun-suffix',
        rows: [
          { label: 'my', arabic: 'رَبِّي', transliteration: 'rabbī', gloss: 'my Lord' },
          { label: 'your (masc.)', arabic: 'رَبُّكَ', transliteration: 'rabbuka', gloss: 'your Lord' },
          { label: 'your (fem.)', arabic: 'رَبُّكِ', transliteration: 'rabbuki', gloss: 'your Lord' },
          { label: 'his', arabic: 'رَبُّهُ', transliteration: 'rabbuhu', gloss: 'his Lord' },
          { label: 'her', arabic: 'رَبُّهَا', transliteration: 'rabbuhā', gloss: 'her Lord' },
          { label: 'our', arabic: 'رَبُّنَا', transliteration: 'rabbunā', gloss: 'our Lord' },
          { label: 'your (masc. plural)', arabic: 'رَبُّكُمْ', transliteration: 'rabbukum', gloss: 'your (m. pl.) Lord' },
          { label: 'your (fem. plural)', arabic: 'رَبُّكُنَّ', transliteration: 'rabbukunna', gloss: 'your (f. pl.) Lord' },
          { label: 'their (masc.)', arabic: 'رَبُّهُمْ', transliteration: 'rabbuhum', gloss: 'their (m.) Lord' },
          { label: 'their (fem.)', arabic: 'رَبُّهُنَّ', transliteration: 'rabbuhunna', gloss: 'their (f.) Lord' },
        ],
      },
      {
        title: 'قَرْيَة (village) — a feminine (ة) noun with the same suffixes',
        kind: 'noun-suffix',
        rows: [
          { label: 'my', arabic: 'قَرْيَتِي', transliteration: 'qaryatī', gloss: 'my village' },
          { label: 'your (masc.)', arabic: 'قَرْيَتُكَ', transliteration: 'qaryatuka', gloss: 'your village' },
          { label: 'his', arabic: 'قَرْيَتُهُ', transliteration: 'qaryatuhu', gloss: 'his village' },
          { label: 'her', arabic: 'قَرْيَتُهَا', transliteration: 'qaryatuhā', gloss: 'her village' },
          { label: 'our', arabic: 'قَرْيَتُنَا', transliteration: 'qaryatunā', gloss: 'our village' },
          { label: 'their', arabic: 'قَرْيَتُهُمْ', transliteration: 'qaryatuhum', gloss: 'their village' },
        ],
      },
      {
        title: 'اسْم (name) with every possessive suffix',
        kind: 'noun-suffix',
        rows: [
          { label: 'my', arabic: 'اسْمِي', transliteration: 'ismī', gloss: 'my name' },
          { label: 'your (masc.)', arabic: 'اسْمُكَ', transliteration: 'ismuka', gloss: 'your name' },
          { label: 'his', arabic: 'اسْمُهُ', transliteration: 'ismuhu', gloss: 'his name' },
          { label: 'her', arabic: 'اسْمُهَا', transliteration: 'ismuhā', gloss: 'her name' },
          { label: 'our', arabic: 'اسْمُنَا', transliteration: 'ismunā', gloss: 'our name' },
          { label: 'their', arabic: 'اسْمُهُمْ', transliteration: 'ismuhum', gloss: 'their name' },
        ],
      },
      {
        title: 'صَنَم (idol) with every possessive suffix',
        kind: 'noun-suffix',
        rows: [
          { label: 'my', arabic: 'صَنَمِي', transliteration: 'ṣanamī', gloss: 'my idol' },
          { label: 'your (masc.)', arabic: 'صَنَمُكَ', transliteration: 'ṣanamuka', gloss: 'your idol' },
          { label: 'his', arabic: 'صَنَمُهُ', transliteration: 'ṣanamuhu', gloss: 'his idol' },
          { label: 'our', arabic: 'صَنَمُنَا', transliteration: 'ṣanamunā', gloss: 'our idol' },
          { label: 'their', arabic: 'صَنَمُهُمْ', transliteration: 'ṣanamuhum', gloss: 'their idol' },
        ],
      },
    ],
  },
  {
    id: 'verb-prefixes-suffixes',
    title: 'Verb Conjugation: Prefixes & Suffixes',
    summary: 'Past-tense verbs take person SUFFIXES; present-tense verbs take person PREFIXES.',
    explanation:
      'Arabic verbs don\'t need a separate pronoun word to show who did the action (though one can still be added for emphasis) — the person is built into the verb itself.\n\n' +
      'Past tense (al-māḍī): start from the "he" form (e.g. عَبَدَ \'abada, "he worshipped") and attach a SUFFIX for other people: ـتُ (-tu) "I", ـتَ (-ta) "you (m.)", ـتِ (-ti) "you (f.)", ـتْ (-at, on the base) "she", ـنَا (-nā) "we", ـتُمْ (-tum) "you (m. pl.)", ـتُنَّ (-tunna) "you (f. pl.)", ـُوا (-ū) "they (m.)", ـنَ (-na) "they (f.)".\n\n' +
      'Present tense (al-muḍāriʿ): start from the root idea (e.g. ـعْبُد -\'bud, "worship") and attach a PREFIX for the person: أَـ (a-) "I", تَـ (ta-) "you (m.) / she", يَـ (ya-) "he", نَـ (na-) "we". Plural and feminine forms add a suffix too, e.g. يَعْبُدُونَ (ya\'budūna) "they (m.) worship", تَعْبُدِينَ (ta\'budīna) "you (f.) worship", يَعْبُدْنَ (ya\'budna) "they (f.) worship".\n\n' +
      'Notice that "you (masc.)" and "she" share the exact same form — تَعْبُدُ can mean "you worship" or "she worships". This is true for EVERY verb in the present tense, not a coincidence: the تَـ prefix does double duty, and Arabic relies on context (or an explicit pronoun: أَنْتَ تَعْبُدُ vs هِيَ تَعْبُدُ) to tell them apart.\n\n' +
      'A note on gender: the masculine plural forms (ـُوا / ـُونَ) are used for all-male AND mixed groups. The feminine plural forms (ـنَ) are used only when the group is entirely female — they are separate forms, not included in the masculine.',
    examples: [
      { arabic: 'عَبَدَ', transliteration: "'abada", gloss: 'he worshipped (base past form)' },
      { arabic: 'عَبَدْتُ', transliteration: "'abadtu", gloss: 'I worshipped (-tu suffix)' },
      { arabic: 'عَبَدْنَا', transliteration: "'abadnā", gloss: 'we worshipped (-nā suffix)' },
      { arabic: 'يَعْبُدُ', transliteration: "ya'budu", gloss: 'he worships (ya- prefix)' },
      { arabic: 'أَعْبُدُ', transliteration: "a'budu", gloss: 'I worship (a- prefix)' },
    ],
    paradigms: [
      {
        title: 'Past tense (الماضي) of عَبَدَ (to worship) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'عَبَدْتُ', transliteration: "'abadtu", gloss: 'I worshipped' },
          { label: 'you (masc.)', arabic: 'عَبَدْتَ', transliteration: "'abadta", gloss: 'you worshipped' },
          { label: 'you (fem.)', arabic: 'عَبَدْتِ', transliteration: "'abadti", gloss: 'you worshipped' },
          { label: 'he', arabic: 'عَبَدَ', transliteration: "'abada", gloss: 'he worshipped' },
          { label: 'she', arabic: 'عَبَدَتْ', transliteration: "'abadat", gloss: 'she worshipped' },
          { label: 'we', arabic: 'عَبَدْنَا', transliteration: "'abadnā", gloss: 'we worshipped' },
          { label: 'you (masc. plural)', arabic: 'عَبَدْتُمْ', transliteration: "'abadtum", gloss: 'you (m. pl.) worshipped' },
          { label: 'you (fem. plural)', arabic: 'عَبَدْتُنَّ', transliteration: "'abadtunna", gloss: 'you (f. pl.) worshipped' },
          { label: 'they (masc.)', arabic: 'عَبَدُوا', transliteration: "'abadū", gloss: 'they (m.) worshipped' },
          { label: 'they (fem.)', arabic: 'عَبَدْنَ', transliteration: "'abadna", gloss: 'they (f.) worshipped' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَعْبُدُ (to worship) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَعْبُدُ', transliteration: "a'budu", gloss: 'I worship' },
          { label: 'you (masc.)', arabic: 'تَعْبُدُ', transliteration: "ta'budu", gloss: 'you worship' },
          { label: 'you (fem.)', arabic: 'تَعْبُدِينَ', transliteration: "ta'budīna", gloss: 'you worship' },
          { label: 'he', arabic: 'يَعْبُدُ', transliteration: "ya'budu", gloss: 'he worships' },
          { label: 'she', arabic: 'تَعْبُدُ', transliteration: "ta'budu", gloss: 'she worships' },
          { label: 'we', arabic: 'نَعْبُدُ', transliteration: "na'budu", gloss: 'we worship' },
          { label: 'you (masc. plural)', arabic: 'تَعْبُدُونَ', transliteration: "ta'budūna", gloss: 'you (m. pl.) worship' },
          { label: 'you (fem. plural)', arabic: 'تَعْبُدْنَ', transliteration: "ta'budna", gloss: 'you (f. pl.) worship' },
          { label: 'they (masc.)', arabic: 'يَعْبُدُونَ', transliteration: "ya'budūna", gloss: 'they (m.) worship' },
          { label: 'they (fem.)', arabic: 'يَعْبُدْنَ', transliteration: "ya'budna", gloss: 'they (f.) worship' },
        ],
      },
      {
        title: 'Past tense (الماضي) of سَكَنَ (to live/dwell) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'سَكَنْتُ', transliteration: 'sakantu', gloss: 'I lived' },
          { label: 'you (masc.)', arabic: 'سَكَنْتَ', transliteration: 'sakanta', gloss: 'you lived' },
          { label: 'you (fem.)', arabic: 'سَكَنْتِ', transliteration: 'sakanti', gloss: 'you lived' },
          { label: 'he', arabic: 'سَكَنَ', transliteration: 'sakana', gloss: 'he lived' },
          { label: 'she', arabic: 'سَكَنَتْ', transliteration: 'sakanat', gloss: 'she lived' },
          { label: 'we', arabic: 'سَكَنَّا', transliteration: 'sakannā', gloss: 'we lived' },
          { label: 'you (plural)', arabic: 'سَكَنْتُمْ', transliteration: 'sakantum', gloss: 'you (pl.) lived' },
          { label: 'they (masc.)', arabic: 'سَكَنُوا', transliteration: 'sakanū', gloss: 'they lived' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَسْكُنُ (to live/dwell) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَسْكُنُ', transliteration: 'askunu', gloss: 'I live' },
          { label: 'you (masc.)', arabic: 'تَسْكُنُ', transliteration: 'taskunu', gloss: 'you live' },
          { label: 'you (fem.)', arabic: 'تَسْكُنِينَ', transliteration: 'taskunīna', gloss: 'you live' },
          { label: 'he', arabic: 'يَسْكُنُ', transliteration: 'yaskunu', gloss: 'he lives' },
          { label: 'she', arabic: 'تَسْكُنُ', transliteration: 'taskunu', gloss: 'she lives' },
          { label: 'we', arabic: 'نَسْكُنُ', transliteration: 'naskunu', gloss: 'we live' },
          { label: 'you (plural)', arabic: 'تَسْكُنُونَ', transliteration: 'taskunūna', gloss: 'you (pl.) live' },
          { label: 'they (masc.)', arabic: 'يَسْكُنُونَ', transliteration: 'yaskunūna', gloss: 'they live' },
        ],
      },
      {
        title: 'Past tense (الماضي) of كَانَ (to be) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'كُنْتُ', transliteration: 'kuntu', gloss: 'I was' },
          { label: 'you (masc.)', arabic: 'كُنْتَ', transliteration: 'kunta', gloss: 'you were' },
          { label: 'you (fem.)', arabic: 'كُنْتِ', transliteration: 'kunti', gloss: 'you were' },
          { label: 'he', arabic: 'كَانَ', transliteration: 'kāna', gloss: 'he was' },
          { label: 'she', arabic: 'كَانَتْ', transliteration: 'kānat', gloss: 'she was' },
          { label: 'we', arabic: 'كُنَّا', transliteration: 'kunnā', gloss: 'we were' },
          { label: 'you (plural)', arabic: 'كُنْتُمْ', transliteration: 'kuntum', gloss: 'you (pl.) were' },
          { label: 'they (masc.)', arabic: 'كَانُوا', transliteration: 'kānū', gloss: 'they were' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَكُونُ (to be) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَكُونُ', transliteration: 'akūnu', gloss: 'I am/will be' },
          { label: 'you (masc.)', arabic: 'تَكُونُ', transliteration: 'takūnu', gloss: 'you are/will be' },
          { label: 'you (fem.)', arabic: 'تَكُونِينَ', transliteration: 'takūnīna', gloss: 'you are/will be' },
          { label: 'he', arabic: 'يَكُونُ', transliteration: 'yakūnu', gloss: 'he is/will be' },
          { label: 'she', arabic: 'تَكُونُ', transliteration: 'takūnu', gloss: 'she is/will be' },
          { label: 'we', arabic: 'نَكُونُ', transliteration: 'nakūnu', gloss: 'we are/will be' },
          { label: 'you (plural)', arabic: 'تَكُونُونَ', transliteration: 'takūnūna', gloss: 'you (pl.) are/will be' },
          { label: 'they (masc.)', arabic: 'يَكُونُونَ', transliteration: 'yakūnūna', gloss: 'they are/will be' },
        ],
      },
      {
        title: 'Past tense (الماضي) of قَالَ (to say) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'قُلْتُ', transliteration: 'qultu', gloss: 'I said' },
          { label: 'you (masc.)', arabic: 'قُلْتَ', transliteration: 'qulta', gloss: 'you said' },
          { label: 'you (fem.)', arabic: 'قُلْتِ', transliteration: 'qulti', gloss: 'you said' },
          { label: 'he', arabic: 'قَالَ', transliteration: 'qāla', gloss: 'he said' },
          { label: 'she', arabic: 'قَالَتْ', transliteration: 'qālat', gloss: 'she said' },
          { label: 'we', arabic: 'قُلْنَا', transliteration: 'qulnā', gloss: 'we said' },
          { label: 'you (plural)', arabic: 'قُلْتُمْ', transliteration: 'qultum', gloss: 'you (pl.) said' },
          { label: 'they (masc.)', arabic: 'قَالُوا', transliteration: 'qālū', gloss: 'they said' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَقُولُ (to say) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَقُولُ', transliteration: 'aqūlu', gloss: 'I say' },
          { label: 'you (masc.)', arabic: 'تَقُولُ', transliteration: 'taqūlu', gloss: 'you say' },
          { label: 'you (fem.)', arabic: 'تَقُولِينَ', transliteration: 'taqūlīna', gloss: 'you say' },
          { label: 'he', arabic: 'يَقُولُ', transliteration: 'yaqūlu', gloss: 'he says' },
          { label: 'she', arabic: 'تَقُولُ', transliteration: 'taqūlu', gloss: 'she says' },
          { label: 'we', arabic: 'نَقُولُ', transliteration: 'naqūlu', gloss: 'we say' },
          { label: 'you (plural)', arabic: 'تَقُولُونَ', transliteration: 'taqūlūna', gloss: 'you (pl.) say' },
          { label: 'they (masc.)', arabic: 'يَقُولُونَ', transliteration: 'yaqūlūna', gloss: 'they say' },
        ],
      },
      {
        title: 'Past tense (الماضي) of دَخَلَ (to enter) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'دَخَلْتُ', transliteration: 'dakhaltu', gloss: 'I entered' },
          { label: 'you (masc.)', arabic: 'دَخَلْتَ', transliteration: 'dakhalta', gloss: 'you entered' },
          { label: 'you (fem.)', arabic: 'دَخَلْتِ', transliteration: 'dakhalti', gloss: 'you entered' },
          { label: 'he', arabic: 'دَخَلَ', transliteration: 'dakhala', gloss: 'he entered' },
          { label: 'she', arabic: 'دَخَلَتْ', transliteration: 'dakhalat', gloss: 'she entered' },
          { label: 'we', arabic: 'دَخَلْنَا', transliteration: 'dakhalnā', gloss: 'we entered' },
          { label: 'you (plural)', arabic: 'دَخَلْتُمْ', transliteration: 'dakhaltum', gloss: 'you (pl.) entered' },
          { label: 'they (masc.)', arabic: 'دَخَلُوا', transliteration: 'dakhalū', gloss: 'they entered' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَدْخُلُ (to enter) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَدْخُلُ', transliteration: 'adkhulu', gloss: 'I enter' },
          { label: 'you (masc.)', arabic: 'تَدْخُلُ', transliteration: 'tadkhulu', gloss: 'you enter' },
          { label: 'you (fem.)', arabic: 'تَدْخُلِينَ', transliteration: 'tadkhulīna', gloss: 'you enter' },
          { label: 'he', arabic: 'يَدْخُلُ', transliteration: 'yadkhulu', gloss: 'he enters' },
          { label: 'she', arabic: 'تَدْخُلُ', transliteration: 'tadkhulu', gloss: 'she enters' },
          { label: 'we', arabic: 'نَدْخُلُ', transliteration: 'nadkhulu', gloss: 'we enter' },
          { label: 'you (plural)', arabic: 'تَدْخُلُونَ', transliteration: 'tadkhulūna', gloss: 'you (pl.) enter' },
          { label: 'they (masc.)', arabic: 'يَدْخُلُونَ', transliteration: 'yadkhulūna', gloss: 'they enter' },
        ],
      },
      {
        title: 'Past tense (الماضي) of تَرَكَ (to leave) — every person',
        kind: 'verb-past',
        rows: [
          { label: 'I', arabic: 'تَرَكْتُ', transliteration: 'taraktu', gloss: 'I left' },
          { label: 'you (masc.)', arabic: 'تَرَكْتَ', transliteration: 'tarakta', gloss: 'you left' },
          { label: 'you (fem.)', arabic: 'تَرَكْتِ', transliteration: 'tarakti', gloss: 'you left' },
          { label: 'he', arabic: 'تَرَكَ', transliteration: 'taraka', gloss: 'he left' },
          { label: 'she', arabic: 'تَرَكَتْ', transliteration: 'tarakat', gloss: 'she left' },
          { label: 'we', arabic: 'تَرَكْنَا', transliteration: 'taraknā', gloss: 'we left' },
          { label: 'you (plural)', arabic: 'تَرَكْتُمْ', transliteration: 'taraktum', gloss: 'you (pl.) left' },
          { label: 'they (masc.)', arabic: 'تَرَكُوا', transliteration: 'tarakū', gloss: 'they left' },
        ],
      },
      {
        title: 'Present tense (المضارع) of يَتْرُكُ (to leave) — every person',
        kind: 'verb-present',
        rows: [
          { label: 'I', arabic: 'أَتْرُكُ', transliteration: 'atruku', gloss: 'I leave' },
          { label: 'you (masc.)', arabic: 'تَتْرُكُ', transliteration: 'tatruku', gloss: 'you leave' },
          { label: 'you (fem.)', arabic: 'تَتْرُكِينَ', transliteration: 'tatrukīna', gloss: 'you leave' },
          { label: 'he', arabic: 'يَتْرُكُ', transliteration: 'yatruku', gloss: 'he leaves' },
          { label: 'she', arabic: 'تَتْرُكُ', transliteration: 'tatruku', gloss: 'she leaves' },
          { label: 'we', arabic: 'نَتْرُكُ', transliteration: 'natruku', gloss: 'we leave' },
          { label: 'you (plural)', arabic: 'تَتْرُكُونَ', transliteration: 'tatrukūna', gloss: 'you (pl.) leave' },
          { label: 'they (masc.)', arabic: 'يَتْرُكُونَ', transliteration: 'yatrukūna', gloss: 'they leave' },
        ],
      },
    ],
  },
  {
    id: 'plural-dual',
    title: 'Plural & Dual Endings',
    summary: 'Suffixes mark "two of something" (dual) and regular plurals — but some plurals change internally instead.',
    explanation:
      'For exactly two of something, Arabic uses a dual suffix: ـَانِ (-āni) as subject, ـَيْنِ (-ayni) as object/after a preposition — e.g. كِتَابَانِ (kitābāni), "two books".\n\n' +
      'Regular ("sound") plurals add a suffix too: masculine ـُونَ (-ūna, subject) / ـِينَ (-īna, object/after preposition), and feminine ـَات (-āt) for most feminine nouns and words describing groups of women.\n\n' +
      'Not every plural is made this way, though — many common nouns take a "broken plural", where the internal vowel pattern changes instead of adding a suffix, similar to English "man → men". رَجُل (rajul, a man) becomes رِجَال (rijāl, men); بَيْت (bayt, a house) becomes بُيُوت (buyūt, houses). There\'s no single rule for which pattern a broken plural takes — it\'s learned per word, the way you just memorize "man → men" in English.',
    examples: [
      { arabic: 'كِتَابَانِ', transliteration: 'kitābāni', gloss: 'two books (subject)' },
      { arabic: 'مُؤْمِنُونَ', transliteration: "mu'minūna", gloss: 'believers (sound masc. plural, subject)' },
      { arabic: 'مُؤْمِنَاتٌ', transliteration: "mu'minātun", gloss: 'believing women (sound fem. plural)' },
      { arabic: 'رِجَالٌ', transliteration: 'rijālun', gloss: 'men (broken plural of رَجُل)' },
    ],
    paradigms: [
      {
        title: 'مُسْلِم (Muslim) — singular, dual, and sound plural',
        rows: [
          { label: 'singular', arabic: 'مُسْلِمٌ', transliteration: 'muslimun', gloss: 'a Muslim' },
          { label: 'dual, subject', arabic: 'مُسْلِمَانِ', transliteration: 'muslimāni', gloss: 'two Muslims' },
          { label: 'dual, object/genitive', arabic: 'مُسْلِمَيْنِ', transliteration: 'muslimayni', gloss: 'two Muslims' },
          { label: 'sound masc. plural, subject', arabic: 'مُسْلِمُونَ', transliteration: 'muslimūna', gloss: 'Muslims' },
          { label: 'sound masc. plural, object/genitive', arabic: 'مُسْلِمِينَ', transliteration: 'muslimīna', gloss: 'Muslims' },
          { label: 'sound fem. plural', arabic: 'مُسْلِمَاتٌ', transliteration: 'muslimātun', gloss: 'Muslim women' },
        ],
      },
      {
        title: 'رَجُل (man) — a broken plural, for comparison',
        rows: [
          { label: 'singular', arabic: 'رَجُلٌ', transliteration: 'rajulun', gloss: 'a man' },
          { label: 'dual, subject', arabic: 'رَجُلَانِ', transliteration: 'rajulāni', gloss: 'two men' },
          { label: 'broken plural', arabic: 'رِجَالٌ', transliteration: 'rijālun', gloss: 'men (irregular pattern, not a suffix)' },
        ],
      },
    ],
  },
]

export function getGrammarConcept(id: string): GrammarConcept | undefined {
  return grammarConcepts.find((g) => g.id === id)
}
