import type { Scene } from './types'
import { Person, at, shown } from './parts'

type Id = 'A' | 'B' | 'C'
const TOTAL: Record<Id, number> = { A: 3, B: 2, C: 1 }
const TONE: Record<Id, string> = { A: 'sc-rr-a', B: 'sc-rr-b', C: 'sc-rr-c' }

interface State {
  /** レジの前から順に並ぶ客と、残りの品数 */
  queue: readonly (readonly [Id, number])[]
  /** 精算が終わった客と、終わった時刻 */
  done: readonly (readonly [Id, number])[]
  /** 時刻ごとに精算した客 */
  ran: readonly Id[]
}

const STATES: readonly State[] = [
  {
    queue: [
      ['A', 3],
      ['B', 2],
      ['C', 1],
    ],
    done: [],
    ran: [],
  },
  {
    queue: [
      ['B', 2],
      ['C', 1],
      ['A', 2],
    ],
    done: [],
    ran: ['A'],
  },
  {
    queue: [
      ['A', 2],
      ['B', 1],
    ],
    done: [['C', 3]],
    ran: ['A', 'B', 'C'],
  },
  {
    queue: [['A', 1]],
    done: [
      ['C', 3],
      ['B', 5],
    ],
    ran: ['A', 'B', 'C', 'A', 'B'],
  },
  {
    queue: [],
    done: [
      ['C', 3],
      ['B', 5],
      ['A', 6],
    ],
    ran: ['A', 'B', 'C', 'A', 'B', 'A'],
  },
  {
    queue: [],
    done: [
      ['C', 3],
      ['B', 5],
      ['A', 6],
    ],
    ran: ['A', 'B', 'C', 'A', 'B', 'A'],
  },
]

/** 客（人と、かごの品） */
function Customer({ id, left }: { id: Id; left: number }) {
  return (
    <g>
      <Person x={0} y={0} />
      <text x={0} y={5} textAnchor="middle" className="sc-person-label">
        {id}
      </text>
      {Array.from({ length: TOTAL[id] }, (_, i) => (
        <rect key={i} x={-21 + i * 15} y={58} width={12} height={12} rx={3} className={`sc-color ${i < left ? TONE[id] : 'sc-off'}`} />
      ))}
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  const pos = new Map<Id, [number, number, number]>()
  s.queue.forEach(([id, left], i) => pos.set(id, [150 + i * 90, 70, left]))
  s.done.forEach(([id], i) => pos.set(id, [480 + i * 56, 70, 0]))
  return (
    <g>
      {/* レジ（CPU） */}
      <rect x={30} y={70} width={70} height={80} rx={8} className="sc-panel" />
      <text x={65} y={106} textAnchor="middle" className="sc-title">
        レジ
      </text>
      <text x={65} y={126} textAnchor="middle" className="sc-small">
        （CPU）
      </text>
      <text x={250} y={40} textAnchor="middle" className="sc-small">
        ← 並んでいる順
      </text>
      <text x={536} y={40} textAnchor="middle" className="sc-small">
        精算が終わった客
      </text>
      <line x1={455} y1={50} x2={455} y2={170} className="sc-line" strokeDasharray="4 4" />
      {(['A', 'B', 'C'] as const).map((id) => {
        const [x, y, left] = pos.get(id) ?? [0, 0, 0]
        const doneAt = s.done.find(([d]) => d === id)?.[1]
        return (
          <g key={id} className="sc-move" style={at(x, y)}>
            <Customer id={id} left={left} />
            {doneAt !== undefined && (
              <text x={0} y={92} textAnchor="middle" className="sc-title sc-ok-text">
                時刻{doneAt}
              </text>
            )}
          </g>
        )
      })}

      {/* 時刻ごとに、だれを精算したか */}
      <text x={30} y={226} className="sc-small">
        時刻ごとに精算した客（1回に1品だけ）
      </text>
      {Array.from({ length: 6 }, (_, t) => {
        const id = s.ran[t]
        return (
          <g key={t}>
            <rect x={30 + t * 72} y={238} width={66} height={44} rx={6} className={`sc-color ${id ? TONE[id] : 'sc-slot'}`} />
            <text x={63 + t * 72} y={267} textAnchor="middle" className="sc-big" style={shown(!!id)}>
              {id ?? ''}
            </text>
            <text x={63 + t * 72} y={300} textAnchor="middle" className="sc-small">
              {t + 1}
            </text>
          </g>
        )
      })}
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={470} y={330} className="sc-small">
          到着順に全部やると（先着順）
        </text>
        <text x={470} y={350} className="sc-small">
          A 3・B 5・C 6 で終わる
        </text>
        <text x={30} y={340} className="sc-title sc-ok-text">
          いちばん短い C が、時刻3で早く終わる
        </text>
      </g>
    </g>
  )
}

export const roundrobinScene: Scene = {
  label: 'レジに並ぶ3人を、1回に1品ずつ順番に精算する（ラウンドロビン）',
  Stage,
  beats: [
    {
      say: 'CPU をレジにたとえます。A は3品、B は2品、C は1品を持って、この順に並んでいます。ラウンドロビンでは、1回に1品（タイムクウォンタム1）だけ精算します。',
    },
    { say: '先頭の A を1品だけ精算します。まだ残っているので、A は列の最後に並び直します。' },
    { say: '次に B を1品（残り1）、C を1品。C は品物がなくなったので、時刻3で終わって列から抜けます。' },
    { say: 'A を1品（残り1）、B を1品。B は時刻5で終わります。' },
    { say: '最後に残った A を1品精算して、時刻6ですべて終わります。' },
    {
      say: '短い仕事ほど、長い仕事に待たされずに早く終わります。だれも長く待たされないので、画面を操作する処理に向いています。',
      formula: '終わる時刻：C 3、B 5、A 6',
    },
  ],
}
