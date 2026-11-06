import type { Scene } from './types'
import { at, shown } from './parts'

const REFS = [1, 2, 3, 1, 4, 1] as const

type Mark = '' | 'new' | 'hit'
interface Desk {
  slots: readonly (number | null)[]
  marks: readonly Mark[]
  faults: number
  out?: number
}

interface State {
  /** 読み終えた参照の数（ポインタは refs[upto-1] を指す） */
  from: number
  upto: number
  fifo: Desk
  lru: Desk
}

const E: Desk = { slots: [null, null, null], marks: ['', '', ''], faults: 0 }
const STATES: readonly State[] = [
  { from: 0, upto: 0, fifo: E, lru: E },
  { from: 0, upto: 3, fifo: { slots: [1, 2, 3], marks: ['new', 'new', 'new'], faults: 3 }, lru: { slots: [1, 2, 3], marks: ['new', 'new', 'new'], faults: 3 } },
  { from: 3, upto: 4, fifo: { slots: [1, 2, 3], marks: ['hit', '', ''], faults: 3 }, lru: { slots: [1, 2, 3], marks: ['hit', '', ''], faults: 3 } },
  {
    from: 4,
    upto: 5,
    fifo: { slots: [4, 2, 3], marks: ['new', '', ''], faults: 4, out: 1 },
    lru: { slots: [1, 4, 3], marks: ['', 'new', ''], faults: 4, out: 2 },
  },
  { from: 5, upto: 6, fifo: { slots: [4, 1, 3], marks: ['', 'new', ''], faults: 5, out: 2 }, lru: { slots: [1, 4, 3], marks: ['hit', '', ''], faults: 4 } },
  { from: 0, upto: 6, fifo: { slots: [4, 1, 3], marks: ['', '', ''], faults: 5 }, lru: { slots: [1, 4, 3], marks: ['', '', ''], faults: 4 } },
]

function Book({ x, y, n, mark }: { x: number; y: number; n: number | null; mark: Mark }) {
  return (
    <g>
      <rect x={x} y={y} width={58} height={70} rx={6} className="sc-slot" />
      {n !== null && (
        <g key={n} className="sc-drop">
          <rect
            x={x + 6}
            y={y + 6}
            width={46}
            height={58}
            rx={4}
            className={`sc-color ${mark === 'hit' ? 'sc-tag-ok' : mark === 'new' ? 'sc-hot' : 'sc-panel'}`}
          />
          <rect x={x + 6} y={y + 6} width={8} height={58} className="sc-book-spine" />
          <text x={x + 33} y={y + 43} textAnchor="middle" className="sc-big">
            {n}
          </text>
        </g>
      )}
    </g>
  )
}

function DeskRow({ y, title, rule, desk }: { y: number; title: string; rule: readonly string[]; desk: Desk }) {
  return (
    <g>
      <text x={30} y={y + 26} className="sc-title">
        {title}
      </text>
      {rule.map((line, i) => (
        <text key={i} x={30} y={y + 48 + i * 17} className="sc-small">
          {line}
        </text>
      ))}
      <rect x={196} y={y + 76} width={212} height={8} rx={3} className="sc-desk" />
      {desk.slots.map((n, i) => (
        <Book key={i} x={204 + i * 68} y={y + 4} n={n} mark={desk.marks[i]!} />
      ))}
      <g className="sc-fade" style={shown(desk.out !== undefined)}>
        <text x={430} y={y + 34} className="sc-small">
          どけた本
        </text>
        <text x={430} y={y + 60} className="sc-title sc-ng-text" fontSize={17}>
          {desk.out ?? ''} → 本棚へ
        </text>
      </g>
      <text x={610} y={y + 30} textAnchor="end" className="sc-small">
        取りに行った回数
      </text>
      <text x={610} y={y + 66} textAnchor="end" className="sc-big">
        {desk.faults}回
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  return (
    <g>
      <text x={30} y={34} className="sc-small">
        読む順番
      </text>
      {REFS.map((r, i) => {
        const now = i >= s.from && i < s.upto && beat !== 5
        const done = i < s.from
        return (
          <g key={i}>
            <rect x={110 + i * 50} y={12} width={40} height={36} rx={8} className={`sc-color ${now ? 'sc-hot' : 'sc-panel'}`} style={shown(true, done)} />
            <text x={130 + i * 50} y={37} textAnchor="middle" className="sc-title" style={shown(true, done)}>
              {r}
            </text>
          </g>
        )
      })}
      <g className="sc-move" style={{ ...at(130 + (Math.max(s.upto, 1) - 1) * 50, 0), ...shown(beat >= 1 && beat <= 4) }}>
        <path d="M 0 52 l -7 10 h 14 Z" className="sc-accent" />
      </g>
      <DeskRow y={74} title="FIFO" rule={['先に来た本から', 'どける']} desk={s.fifo} />
      <line x1={20} y1={186} x2={620} y2={186} className="sc-line" />
      <DeskRow y={200} title="LRU" rule={['いちばん長く使って', 'いない本をどける']} desk={s.lru} />
      <g className="sc-legend">
        <rect x={30} y={326} width={14} height={14} rx={3} className="sc-hot" />
        <text x={50} y={338} className="sc-small">
          本棚から取ってきた（ページフォールト）
        </text>
        <rect x={300} y={326} width={14} height={14} rx={3} className="sc-tag-ok" />
        <text x={320} y={338} className="sc-small">
          机にあった（ヒット）
        </text>
      </g>
    </g>
  )
}

export const pagingScene: Scene = {
  label: '机（実メモリ）に3冊だけ置ける。FIFO と LRU で、本棚へ取りに行く回数を比べる',
  Stage,
  beats: [
    {
      say: '机（実メモリ）には本が3冊しか置けません。読みたい本の順番は 1, 2, 3, 1, 4, 1。机にない本は、遠い本棚（ディスク）まで取りに行きます。これがページフォールトです。',
    },
    { say: '最初は机が空なので、1, 2, 3 は3回とも取りに行きます。どちらのやり方でも同じです。' },
    { say: '次の 1 は机にあります（ヒット）。取りに行かずにすみます。' },
    { say: '4 を読みたいが、机はいっぱい。FIFO は一番先に来た 1 をどけます。LRU は一番長く使っていない 2 をどけます。' },
    { say: '最後の 1。FIFO はさっき 1 をどけてしまったので、また取りに行きます。LRU は 1 を残していたのでヒットです。' },
    {
      say: '取りに行った回数は FIFO が5回、LRU が4回。最近使ったものはまたすぐ使われやすいので、LRU のほうが少なくなりやすいのです。',
      formula: 'FIFO 5回 ＞ LRU 4回',
    },
  ],
}
