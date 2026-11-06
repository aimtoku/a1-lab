import type { Scene } from './types'
import { shown } from './parts'

/** 100日のカレンダー。止まった日の番号（0〜99） */
const WEB1 = [3, 14, 27, 38, 45, 59, 66, 72, 88, 95]
const WEB2 = [7, 14, 31, 40, 52, 61, 77, 83, 90, 99]
const WEB = WEB1.filter((d) => WEB2.includes(d))
const DB = [20, 41, 57, 70, 86]
const ALL = [...new Set([...WEB, ...DB])]

interface Slot {
  title: string
  sub: string
  down: readonly number[]
  on: boolean
}

/** 場面ごとに、3つの枠に何を出すか */
const SLOTS: readonly (readonly [Slot, Slot, Slot])[] = (() => {
  const off: Slot = { title: '', sub: '', down: [], on: false }
  const w1: Slot = { title: 'Webサーバ①', sub: '稼働率 0.9', down: WEB1, on: true }
  const w2: Slot = { title: 'Webサーバ②', sub: '稼働率 0.9', down: WEB2, on: true }
  const web: Slot = { title: 'Web（2台並列）', sub: '0.99', down: WEB, on: true }
  const db: Slot = { title: 'DBサーバ', sub: '稼働率 0.95', down: DB, on: true }
  const all: Slot = { title: 'システム全体', sub: '約 0.94', down: ALL, on: true }
  const db2: Slot = { title: 'DB（2台並列）', sub: '0.9975', down: [], on: true }
  const all2: Slot = { title: 'システム全体', sub: '約 0.9875', down: WEB, on: true }
  return [
    [w1, off, off],
    [w1, w2, web],
    [web, db, off],
    [web, db, all],
    [web, db2, all2],
  ]
})()

const OPS: readonly (readonly [string, string])[] = [
  ['', ''],
  ['どちらか', '動けばOK'],
  ['', ''],
  ['両方', '動いてOK'],
  ['両方', '動いてOK'],
]

const CELL = 12
const GAP = 2

function Calendar({ x, slot }: { x: number; slot: Slot }) {
  return (
    <g className="sc-fade" style={shown(slot.on)}>
      <text x={x + 69} y={58} textAnchor="middle" className="sc-title">
        {slot.title}
      </text>
      {Array.from({ length: 100 }, (_, d) => {
        const down = slot.down.includes(d)
        return (
          <rect
            key={d}
            x={x + (d % 10) * (CELL + GAP)}
            y={72 + Math.floor(d / 10) * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={2}
            className={`sc-color ${down ? 'sc-day-down' : 'sc-day-up'}`}
          />
        )
      })}
      <text x={x + 69} y={240} textAnchor="middle" className="sc-big">
        {slot.sub}
      </text>
      <text x={x + 69} y={264} textAnchor="middle" className="sc-small">
        止まる日 {slot.down.length}日 / 100日
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const slots = SLOTS[beat]!
  const [op1, op2] = OPS[beat]!
  const xs = [40, 250, 460]
  return (
    <g>
      {slots.map((s, i) => (
        <Calendar key={i} x={xs[i]!} slot={s} />
      ))}
      <g className="sc-fade" style={shown(!!op1)}>
        <text x={xs[1]! + 175} y={140} textAnchor="middle" className="sc-title">
          {op1}
        </text>
        <text x={xs[1]! + 175} y={160} textAnchor="middle" className="sc-title">
          {op2}
        </text>
        <text x={xs[1]! + 175} y={190} textAnchor="middle" className="sc-big">
          →
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 2)}>
        <text x={xs[0]! + 175} y={150} textAnchor="middle" className="sc-big">
          ＋
        </text>
      </g>
      <g className="sc-legend">
        <rect x={40} y={300} width={12} height={12} rx={2} className="sc-day-up" />
        <text x={58} y={311} className="sc-small">
          動いた日
        </text>
        <rect x={130} y={300} width={12} height={12} rx={2} className="sc-day-down" />
        <text x={148} y={311} className="sc-small">
          止まった日（1マス＝1日）
        </text>
      </g>
    </g>
  )
}

export const availabilityScene: Scene = {
  label: '100日のカレンダーで、稼働率の直列と並列を比べる',
  Stage,
  beats: [
    { say: '稼働率 0.9 は「100日のうち 90日 動いて、10日 止まる」ということです。赤いマスが止まった日です。' },
    {
      say: 'Webサーバを2台並べます（並列）。どちらか1台が動いていれば OK なので、止まるのは2台とも止まった日だけ。100日で1日、稼働率 0.99 です。',
      formula: '1 − (1 − 0.9) × (1 − 0.9) = 0.99',
    },
    { say: 'うしろには DBサーバが1台あり、稼働率 0.95（100日で5日止まる）です。Web と DB は、順につながっています（直列）。' },
    {
      say: '直列は、両方が動いて初めて OK。どちらかが止まった日は全体も止まるので、止まる日が増えます。稼働率はかけ算で約 0.94 です。',
      formula: '0.99 × 0.95 ≒ 0.94',
    },
    {
      say: '弱い DB も2台の並列にすると 0.9975。全体は約 0.9875 まで上がり、止まる日は100日で1日ほどになります。いちばん弱いところを並列にするのが効きます。',
      formula: '0.99 × {1 − (1 − 0.95)²} = 0.99 × 0.9975 ≒ 0.9875',
    },
  ],
}
