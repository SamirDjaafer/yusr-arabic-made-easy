export type LeitnerRating = 'again' | 'hard' | 'good' | 'easy'

const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16] as const // index = box 0..4

export function intervalDaysForBox(box: number): number {
  return BOX_INTERVAL_DAYS[Math.min(Math.max(box, 0), BOX_INTERVAL_DAYS.length - 1)]
}

export function nextBoxForRating(currentBox: number, rating: LeitnerRating): number {
  switch (rating) {
    case 'again':
      return 0
    case 'hard':
      return Math.max(currentBox - 1, 0)
    case 'good':
      return Math.min(currentBox + 1, BOX_INTERVAL_DAYS.length - 1)
    case 'easy':
      return Math.min(currentBox + 2, BOX_INTERVAL_DAYS.length - 1)
  }
}

export function addDaysIso(days: number): string {
  const d = new Date(Date.now() + days * 86400000)
  return d.toISOString().slice(0, 10)
}
