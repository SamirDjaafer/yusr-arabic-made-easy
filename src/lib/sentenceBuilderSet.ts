// A small rotating set of pre-determined sentences for the Sentence Lab's
// "Sentence Builder" — reusing exercises already vetted inside the stories
// (plus a couple of new ones) so every sentence here is grammatically
// checked, not freshly generated. Each has ≤7 tiles so it stays readable.

export interface BuilderSentence {
  id: string
  /** the story this sentence belongs to — the lab only rotates sentences from lessons ≤ your current one */
  storyId: string
  tiles: string[]
  correctOrder: string[]
  englishGloss: string
  explanation: string
}

export const sentenceBuilderSet: BuilderSentence[] = [
  {
    id: 'sb-1',
    storyId: 'story-01',
    tiles: ['مُشْرِكًا', 'هَذَا الرَّجُلُ', 'كَانَ'],
    correctOrder: ['كَانَ', 'هَذَا الرَّجُلُ', 'مُشْرِكًا'],
    englishGloss: 'This man was a polytheist.',
    explanation: 'كَانَ (was) opens the sentence, then its subject هَذَا الرَّجُلُ, then مُشْرِكًا — the predicate of كَانَ, which is why it takes the accusative -an ending rather than -un.',
  },
  {
    id: 'sb-2',
    storyId: 'story-02',
    tiles: ['الْأَصْنَامَ', 'لَمْ يَعْبُدْ', 'إِبْرَاهِيمُ'],
    correctOrder: ['لَمْ يَعْبُدْ', 'إِبْرَاهِيمُ', 'الْأَصْنَامَ'],
    englishGloss: 'Ibrahim did not worship the idols.',
    explanation: 'لَمْ يَعْبُدْ (did not worship) still behaves like a verb and comes first, then the subject إِبْرَاهِيمُ, then the object الْأَصْنَامَ.',
  },
  {
    id: 'sb-3',
    storyId: 'story-03',
    tiles: ['وَحْدَهُ', 'اللَّهَ', 'نَعْبُدُ', 'نَحْنُ'],
    correctOrder: ['نَحْنُ', 'نَعْبُدُ', 'اللَّهَ', 'وَحْدَهُ'],
    englishGloss: 'We worship Allah alone.',
    explanation: 'نَحْنُ (we, for emphasis) — نَعْبُدُ (the نَـ prefix already means "we") — اللَّهَ (the object) — وَحْدَهُ ("alone", literally "his aloneness").',
  },
  {
    id: 'sb-4',
    storyId: 'story-04',
    tiles: ['الْأَصْنَامَ', 'إِبْرَاهِيمُ', 'كَسَرَ'],
    correctOrder: ['كَسَرَ', 'إِبْرَاهِيمُ', 'الْأَصْنَامَ'],
    englishGloss: 'Ibrahim broke the idols.',
    explanation: 'كَسَرَ (broke) — إِبْرَاهِيمُ (subject, nominative -u) — الْأَصْنَامَ (object, accusative -a).',
  },
  {
    id: 'sb-5',
    storyId: 'story-05',
    tiles: ['هَذَا', 'مَنْ فَعَلَ', 'قَالُوا'],
    correctOrder: ['قَالُوا', 'مَنْ فَعَلَ', 'هَذَا'],
    englishGloss: 'They said: who did this?',
    explanation: 'قَالُوا (they said, ـُوا = "they") starts the sentence, then the embedded question مَنْ فَعَلَ (who did) هَذَا (this).',
  },
  {
    id: 'sb-6',
    storyId: 'story-03',
    tiles: ['يُؤْمِنُونَ بِهِ', 'مَعَ الَّذِينَ', 'وَاللَّهُ'],
    correctOrder: ['وَاللَّهُ', 'مَعَ الَّذِينَ', 'يُؤْمِنُونَ بِهِ'],
    englishGloss: 'And Allah is with those who believe in Him.',
    explanation: 'وَاللَّهُ (and Allah, subject) — مَعَ الَّذِينَ (with those who) — يُؤْمِنُونَ بِهِ (they believe in Him) — the يُـ prefix + ـونَ suffix mark "they" in the present tense.',
  },
  {
    id: 'sb-7',
    storyId: 'story-03',
    tiles: ['وَحْدَهُ', 'اللَّهَ', 'نَعْبُدُ', 'الْمُسْلِمُونَ', 'نَحْنُ'],
    correctOrder: ['نَحْنُ', 'الْمُسْلِمُونَ', 'نَعْبُدُ', 'اللَّهَ', 'وَحْدَهُ'],
    englishGloss: 'We, the Muslims, worship Allah alone.',
    explanation: 'نَحْنُ الْمُسْلِمُونَ (we, the Muslims — a pronoun + a definite noun in apposition) — نَعْبُدُ اللَّهَ وَحْدَهُ (we worship Allah alone), just as in Story 3.',
  },
]
