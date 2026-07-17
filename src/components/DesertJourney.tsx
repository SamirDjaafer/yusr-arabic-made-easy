import { useNavigate } from 'react-router-dom'
import { useProgressStore, MASTERY_TARGET } from '../store/progressStore'
import { useFlashcardStore } from '../store/flashcardStore'
import { getStoryById, stories } from '../data/stories'
import { getStoryDeck } from '../lib/storyDecks'

// The desert journey — ported from the original Yusr Arabic milestone map:
// a sunset-gradient desert where each lesson is a tent followed by five
// standing torches (Reading, Memorise Vocab, Grammar, Exercises,
// Challenges). Torches light up as you master each part, and the traveller
// figure walks the path between them. SVG shapes and layout constants are
// faithful ports of the original implementation.

const STOP_H = 170
const FIRST_Y = 100
const X_LEFT = 80
const X_RIGHT = 600
const stopY = (i: number) => FIRST_Y + i * STOP_H
const stopX = (i: number) => (i % 2 === 0 ? X_LEFT : X_RIGHT)

const DRILL_TYPES = ['change-one-word', 'true-false', 'vocab-translate']
const CHALLENGE_IDS = ['own-sentences', 'translate', 'comprehension']

interface TorchStop {
  key: 'reading' | 'flashcards' | 'grammar' | 'exercises' | 'challenges'
  label: string
  route: string
}

function useTorchFractions(storyId: string): Record<TorchStop['key'], number> {
  const completedStoryIds = useProgressStore((s) => s.completedStoryIds)
  const grammarDone = useProgressStore((s) => s.grammarDone)
  const drillMastery = useProgressStore((s) => s.drillMastery)
  const challenges = useProgressStore((s) => s.challenges)
  const mastered = useFlashcardStore((s) => s.mastered)

  const deck = getStoryDeck(storyId)
  const deckDone = deck.filter((c) => mastered[c.id]).length

  const drillSum = DRILL_TYPES.reduce((sum, t) => sum + Math.min(1, (drillMastery[storyId]?.[t] ?? 0) / MASTERY_TARGET), 0)
  const submitted = CHALLENGE_IDS.filter((id) => challenges[storyId]?.[id]?.submitted).length

  return {
    reading: completedStoryIds.includes(storyId) ? 1 : 0,
    flashcards: deck.length > 0 ? deckDone / deck.length : 0,
    grammar: grammarDone[storyId] ? 1 : 0,
    exercises: drillSum / DRILL_TYPES.length,
    challenges: submitted / CHALLENGE_IDS.length,
  }
}

function TentShape({ x, y, open }: { x: number; y: number; open: boolean }) {
  return (
    <>
      <ellipse cx={x} cy={y + 6} rx={42} ry={10} fill="#2A1018" fillOpacity={0.6} />
      {open && <circle cx={x} cy={y - 25} r={55} fill="#F2934A" fillOpacity={0.22} />}
      <g transform={`translate(${x},${y}) scale(0.72)`}>
        <path d="M-30,0 Q-30,-70 0,-88 Q30,-70 30,0 Z" fill="#1A0B10" stroke="#0D0507" strokeWidth={1.5} />
        {open ? (
          <>
            <path d="M0,-88 Q30,-70 30,0" fill="none" stroke="#E8794A" strokeWidth={2} strokeOpacity={0.7} />
            <polygon points="-12,0 12,0 0,-50" fill="#F4C14E" fillOpacity={0.85} />
            <line x1={0} y1={-88} x2={0} y2={-104} stroke="#1A0B10" strokeWidth={2} />
            <polygon points="0,-104 18,-98 0,-92" fill="#8B2035" />
          </>
        ) : (
          <>
            <line x1={0} y1={-88} x2={0} y2={0} stroke="#0D0507" strokeWidth={1.5} />
            <circle cx={0} cy={-24} r={6} fill="#0D0507" stroke="#000000" strokeWidth={1} />
            <line x1={-7} y1={-30} x2={7} y2={-18} stroke="#000000" strokeWidth={1.5} />
            <line x1={7} y1={-30} x2={-7} y2={-18} stroke="#000000" strokeWidth={1.5} />
            <line x1={0} y1={-88} x2={0} y2={-102} stroke="#1A0B10" strokeWidth={2} />
            <polygon points="0,-102 0,-92 10,-97" fill="#3A1A20" />
          </>
        )}
      </g>
    </>
  )
}

function TorchShape({ x, groundY, lit }: { x: number; groundY: number; lit: boolean }) {
  const poleTop = groundY - 46
  return (
    <>
      <ellipse cx={x} cy={groundY + 6} rx={18} ry={6} fill="#2A1018" fillOpacity={0.6} />
      <line x1={x} y1={groundY} x2={x} y2={poleTop} stroke="#1A0B10" strokeWidth={5} strokeLinecap="round" />
      {lit ? (
        <>
          <path
            d={`M${x - 11},${poleTop + 5} Q${x},${poleTop - 30} ${x + 11},${poleTop + 5} Q${x},${poleTop + 20} ${x - 11},${poleTop + 5} Z`}
            fill="#F4C14E"
            stroke="#E07A2E"
            strokeWidth={1}
          />
          <path
            d={`M${x - 5},${poleTop + 3} Q${x},${poleTop - 18} ${x + 5},${poleTop + 3} Q${x},${poleTop + 11} ${x - 5},${poleTop + 3} Z`}
            fill="#FCE2A0"
          />
        </>
      ) : (
        <path
          d={`M${x - 11},${poleTop + 5} Q${x},${poleTop - 30} ${x + 11},${poleTop + 5} Q${x},${poleTop + 20} ${x - 11},${poleTop + 5} Z`}
          fill="#1A0B10"
          stroke="#0D0507"
          strokeWidth={1}
        />
      )}
    </>
  )
}

function FigureShape({ x, y, facing }: { x: number; y: number; facing: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(0.45)`}>
      <g transform={facing < 0 ? 'translate(80,0) scale(-1,1)' : undefined}>
        <path d="M40,28 Q14,55 9,124 L40,130 L71,132 Q66,55 40,28 Z" fill="#170A0C" />
        <path d="M40,28 Q60,55 65,124 L52,127 Q50,70 40,40 Z" fill="#0E0608" />
        <path d="M42,30 Q62,56 67,123" fill="none" stroke="#E8794A" strokeWidth={2} strokeOpacity={0.6} />
        <ellipse cx={40} cy={16} rx={13} ry={14} fill="#170A0C" />
        <line x1={66} y1={55} x2={80} y2={128} stroke="#170A0C" strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  )
}

export function DesertJourney({ storyId }: { storyId: string }) {
  const navigate = useNavigate()
  const fractions = useTorchFractions(storyId)
  const story = getStoryById(storyId)
  if (!story) return null
  const nextStory = stories.find((s) => s.order === story.order + 1)

  const torches: TorchStop[] = [
    { key: 'reading', label: 'Reading', route: `/stories/${storyId}` },
    { key: 'flashcards', label: 'Memorise Vocab', route: '/flashcards' },
    { key: 'grammar', label: 'Grammar', route: '/grammar' },
    { key: 'exercises', label: 'Exercises', route: '/exercises' },
    { key: 'challenges', label: 'Challenges', route: '/challenges' },
  ]

  const numLit = torches.reduce((sum, t) => sum + fractions[t.key], 0)
  const nextIdx = torches.findIndex((t) => fractions[t.key] < 1)

  // figure position along the path (port of msLessonFigurePos)
  const frac = Math.min(numLit, 5)
  const idx = Math.min(Math.floor(frac) + 1, 6)
  const segFrac = frac - Math.floor(frac)
  const p0 = { x: stopX(idx), y: stopY(idx) }
  const p1 = { x: stopX(idx + 1), y: stopY(idx + 1) }
  const figX = p0.x + (p1.x - p0.x) * segFrac
  const figY = p0.y + (p1.y - p0.y) * segFrac
  const from = segFrac > 0 ? p0 : { x: stopX(idx - 1), y: stopY(idx - 1) }
  const to = segFrac > 0 ? p1 : p0
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const OFFSET = 40
  const fig = { x: figX - (dx / dist) * OFFSET, y: figY - (dy / dist) * OFFSET, facing: to.x - from.x }

  const totalStops = 7 // tent + 5 torches + next tent
  const totalHeight = stopY(totalStops - 1) + 60

  // path segments (lit / partially lit / unlit)
  const charIdx = Math.min(Math.floor(frac) + 1, 6)
  const charSegFrac = frac - Math.floor(frac)
  const segments = []
  for (let i = 0; i < totalStops - 1; i++) {
    let f: number
    if (i <= charIdx - 1) f = 1
    else if (i === charIdx) f = charSegFrac
    else f = 0
    segments.push({ i, f })
  }

  const labelPill = (x: number, y: number, text: string) => {
    const w = text.length * 7 + 24
    return (
      <>
        <rect x={x - w / 2} y={y + 17} width={w} height={26} rx={13} fill="#FCE2A0" />
        <text x={x} y={y + 34} fontSize={13} fontWeight={500} fill="#4A1B0C" textAnchor="middle">
          {text}
        </text>
      </>
    )
  }

  return (
    <svg width="100%" viewBox={`0 0 680 ${totalHeight}`} role="img" style={{ display: 'block', borderRadius: '1.5rem' }}>
      <defs>
        <linearGradient id="msSunset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9522E" />
          <stop offset="1" stopColor="#2A0A14" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={680} height={totalHeight} fill="url(#msSunset)" />

      {segments.map(({ i, f }) => {
        const a = { x: stopX(i), y: stopY(i) }
        const b = { x: stopX(i + 1), y: stopY(i + 1) }
        if (f >= 1) {
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#F2934A" strokeWidth={10} strokeOpacity={0.25} strokeLinecap="round" />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#F4C14E" strokeWidth={3} strokeOpacity={0.9} strokeLinecap="round" />
            </g>
          )
        }
        if (f > 0) {
          const mx = a.x + (b.x - a.x) * f
          const my = a.y + (b.y - a.y) * f
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={mx} y2={my} stroke="#F2934A" strokeWidth={10} strokeOpacity={0.25} strokeLinecap="round" />
              <line x1={a.x} y1={a.y} x2={mx} y2={my} stroke="#F4C14E" strokeWidth={3} strokeOpacity={0.9} strokeLinecap="round" />
              <line x1={mx} y1={my} x2={b.x} y2={b.y} stroke="#6B4A3E" strokeWidth={3} strokeDasharray="3 8" strokeOpacity={0.5} />
            </g>
          )
        }
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6B4A3E" strokeWidth={3} strokeDasharray="3 8" strokeOpacity={0.5} />
      })}

      {/* current lesson tent (Home) */}
      <g>
        <circle cx={stopX(0)} cy={stopY(0) - 25} r={72} fill="#F4C14E" fillOpacity={0.16} stroke="#F4C14E" strokeWidth={2} strokeOpacity={0.7} />
        <TentShape x={stopX(0)} y={stopY(0)} open />
        <rect x={stopX(0) - 34} y={stopY(0) + 31} width={68} height={26} rx={13} fill="#FCE2A0" />
        <text x={stopX(0)} y={stopY(0) + 48} fontSize={13} fontWeight={500} fill="#4A1B0C" textAnchor="middle">
          Home
        </text>
      </g>

      {/* torches */}
      {torches.map((t, ti) => {
        const i = ti + 1
        const x = stopX(i)
        const y = stopY(i)
        const lit = fractions[t.key] >= 1
        const isNext = ti === nextIdx
        return (
          <g key={t.key} style={{ cursor: 'pointer' }} onClick={() => navigate(t.route)}>
            {lit && (
              <>
                <circle cx={x} cy={y - 25} r={60} fill="#F2934A" fillOpacity={0.2} />
                <circle cx={x} cy={y - 25} r={32} fill="#F2934A" fillOpacity={0.3} />
              </>
            )}
            {isNext ? (
              <circle cx={x} cy={y - 30} r={46} fill="#FFD23F" fillOpacity={0.28} stroke="#FFD23F" strokeWidth={3} strokeOpacity={0.95} className="animate-pulse" />
            ) : (
              <circle cx={x} cy={y - 30} r={40} fill="#F4C14E" fillOpacity={0.14} stroke="#F4C14E" strokeWidth={2} strokeOpacity={0.65} />
            )}
            <TorchShape x={x} groundY={y} lit={lit} />
            {labelPill(x, y, t.label)}
          </g>
        )
      })}

      {/* next lesson's tent */}
      <TentShape x={stopX(6)} y={stopY(6)} open={false} />
      <text x={stopX(6)} y={stopY(6) + 44} fontSize={14} fill="#C9A8A0" textAnchor="middle" style={{ fontWeight: 500 }}>
        {nextStory ? `Lesson ${nextStory.order}` : 'Journey complete'}
      </text>

      {/* traveller */}
      <circle cx={fig.x} cy={fig.y - 20} r={35} fill="#F2934A" fillOpacity={0.12} />
      <FigureShape x={fig.x - 20} y={fig.y - 59} facing={fig.facing} />
    </svg>
  )
}
