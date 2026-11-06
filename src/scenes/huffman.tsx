import type { Scene } from './types'
import { at, shown } from './parts'

interface N {
  id: string
  label: string
  p: string
  /** 場面ごとの位置 [x, y]。null は未登場 */
  pos: (beat: number) => readonly [number, number] | null
  leaf: boolean
}

const FINAL: Record<string, readonly [number, number]> = {
  root: [300, 60],
  A: [170, 150],
  n5: [430, 150],
  B: [330, 240],
  n2: [530, 240],
  C: [470, 320],
  D: [590, 320],
}

const NODES: readonly N[] = [
  { id: 'A', label: 'A', p: '0.5', leaf: true, pos: (b) => (b >= 3 ? FINAL.A! : [110, 320]) },
  { id: 'B', label: 'B', p: '0.3', leaf: true, pos: (b) => (b >= 2 ? FINAL.B! : [250, 320]) },
  { id: 'C', label: 'C', p: '0.1', leaf: true, pos: () => FINAL.C! },
  { id: 'D', label: 'D', p: '0.1', leaf: true, pos: () => FINAL.D! },
  { id: 'n2', label: '', p: '0.2', leaf: false, pos: (b) => (b >= 1 ? FINAL.n2! : null) },
  { id: 'n5', label: '', p: '0.5', leaf: false, pos: (b) => (b >= 2 ? FINAL.n5! : null) },
  { id: 'root', label: '', p: '1.0', leaf: false, pos: (b) => (b >= 3 ? FINAL.root! : null) },
]

const EDGES: readonly { from: string; to: string; bit: string; at: number }[] = [
  { from: 'n2', to: 'C', bit: '0', at: 1 },
  { from: 'n2', to: 'D', bit: '1', at: 1 },
  { from: 'n5', to: 'B', bit: '0', at: 2 },
  { from: 'n5', to: 'n2', bit: '1', at: 2 },
  { from: 'root', to: 'A', bit: '0', at: 3 },
  { from: 'root', to: 'n5', bit: '1', at: 3 },
]

const CODES = [
  ['A', '0', '0.5'],
  ['B', '10', '0.3'],
  ['C', '110', '0.1'],
  ['D', '111', '0.1'],
] as const

function Stage({ beat }: { beat: number }) {
  const show = beat < 5
  return (
    <g>
      <g className="sc-fade" style={shown(show)}>
        {EDGES.map((e) => {
          const a = FINAL[e.from]!
          const b = FINAL[e.to]!
          const on = beat >= e.at
          return (
            <g key={`${e.from}-${e.to}`} className="sc-fade" style={shown(on)}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={beat === 4 ? 'sc-accent-stroke' : 'sc-tree-edge'} />
              <g className="sc-fade" style={shown(beat >= 3)}>
                <circle cx={(a[0] + b[0]) / 2} cy={(a[1] + b[1]) / 2} r={11} className="sc-bit" />
                <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 + 5} textAnchor="middle" className="sc-title">
                  {e.bit}
                </text>
              </g>
            </g>
          )
        })}
        {NODES.map((n) => {
          const p = n.pos(beat)
          return (
            <g key={n.id} className="sc-move" style={{ ...at(p?.[0] ?? FINAL[n.id]![0], p?.[1] ?? FINAL[n.id]![1]), ...shown(p !== null) }}>
              <circle r={n.leaf ? 26 : 20} className={n.leaf ? 'sc-leaf' : 'sc-node'} />
              <text y={n.leaf ? -2 : 5} textAnchor="middle" className={n.leaf ? 'sc-title' : 'sc-small'}>
                {n.leaf ? n.label : n.p}
              </text>
              {n.leaf && (
                <text y={14} textAnchor="middle" className="sc-small">
                  {n.p}
                </text>
              )}
            </g>
          )
        })}
        <g className="sc-fade" style={shown(beat === 4)}>
          {CODES.map(([k, code], i) => (
            <text key={k} x={30} y={60 + i * 28} className="sc-title">
              {k} = {code}
            </text>
          ))}
        </g>
      </g>

      {/* 平均の長さ */}
      <g className="sc-fade" style={shown(!show)}>
        {CODES.map(([k, code, p], i) => (
          <g key={k}>
            <text x={60} y={80 + i * 50} className="sc-big">
              {k}
            </text>
            {[...code].map((bit, j) => (
              <g key={j}>
                <rect x={100 + j * 40} y={56 + i * 50} width={34} height={34} rx={6} className="sc-hot" />
                <text x={117 + j * 40} y={80 + i * 50} textAnchor="middle" className="sc-title">
                  {bit}
                </text>
              </g>
            ))}
            <text x={250} y={80 + i * 50} className="sc-text">
              {code.length}ビット × 確率 {p} = {(code.length * Number(p)).toFixed(1)}
            </text>
          </g>
        ))}
        <text x={320} y={300} textAnchor="middle" className="sc-big sc-ok-text">
          平均 1.7 ビット（全部2ビットで表すより短い）
        </text>
      </g>
    </g>
  )
}

export const huffmanScene: Scene = {
  label: '出やすさの違う4つの記号を、小さい順に2つずつまとめて木を作り、符号を割り当てる（ハフマン符号）',
  Stage,
  beats: [
    { say: '記号 A, B, C, D の出やすさ（確率）は 0.5, 0.3, 0.1, 0.1 です。よく出る記号ほど短い符号にすると、全体のビット数が減ります。' },
    { say: 'いちばん出にくい2つ、C と D をまとめて、合計 0.2 の節を作ります。' },
    { say: '残りは A 0.5、B 0.3、節 0.2。小さい2つ（B と 0.2 の節）をまとめて 0.5 の節にします。' },
    { say: '最後の2つ（A と 0.5 の節）をまとめると、木の根（1.0）ができます。枝の左に 0、右に 1 を付けます。' },
    { say: '根から各記号まで、枝の数字を順に読むと符号になります。A = 0、B = 10、C = 110、D = 111。よく出る A がいちばん短くなっています。' },
    {
      say: '「符号の長さ × 確率」を足すと、平均は 1.7ビットです。4つの記号を同じ長さで表すと 2ビット要るので、短くなりました。',
      formula: '1 × 0.5 + 2 × 0.3 + 3 × 0.1 + 3 × 0.1 = 1.7',
    },
  ],
}
