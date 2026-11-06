import type { Scene } from './types'
import { at, shown } from './parts'

const TOKENS = ['3', '4', '+', '2', '×'] as const

interface Plate {
  id: string
  v: string
}

/** 場面ごと：読んでいる記号の位置、箱の中の皿（下から）、取り出した皿と計算 */
const STATES: readonly { pos: number; stack: readonly Plate[]; popped?: string }[] = [
  { pos: -1, stack: [] },
  { pos: 0, stack: [{ id: 'a', v: '3' }] },
  {
    pos: 1,
    stack: [
      { id: 'a', v: '3' },
      { id: 'b', v: '4' },
    ],
  },
  { pos: 2, stack: [{ id: 'c', v: '7' }], popped: '3 + 4 = 7' },
  {
    pos: 3,
    stack: [
      { id: 'c', v: '7' },
      { id: 'd', v: '2' },
    ],
  },
  { pos: 4, stack: [{ id: 'e', v: '14' }], popped: '7 × 2 = 14' },
  { pos: 5, stack: [{ id: 'e', v: '14' }] },
]

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  return (
    <g>
      {/* 式のテープ */}
      <text x={40} y={40} className="sc-small">
        式（逆ポーランド記法）
      </text>
      {TOKENS.map((t, i) => {
        const done = i < s.pos
        const now = i === s.pos
        return (
          <g key={i}>
            <rect x={40 + i * 62} y={52} width={52} height={52} rx={10} className={`sc-color ${now ? 'sc-hot' : 'sc-panel'}`} style={shown(true, done)} />
            <text x={66 + i * 62} y={88} textAnchor="middle" className="sc-big" style={shown(true, done)}>
              {t}
            </text>
          </g>
        )
      })}
      <g className="sc-move" style={{ ...at(66 + Math.max(s.pos, 0) * 62, 0), ...shown(s.pos >= 0 && s.pos < 5) }}>
        <path d="M 0 112 l -9 14 h 18 Z" className="sc-accent" />
        <text x={0} y={144} textAnchor="middle" className="sc-small">
          いま読む
        </text>
      </g>

      {/* 皿を積む箱（スタック） */}
      <path d="M 380 120 V 330 H 520 V 120" className="sc-box" />
      <text x={450} y={350} textAnchor="middle" className="sc-small">
        スタック（皿を積む箱）
      </text>
      {s.stack.map((p, k) => (
        <g key={p.id} className="sc-drop">
          <g className="sc-move" style={at(0, 0)}>
            <ellipse cx={450} cy={308 - k * 40} rx={58} ry={16} className="sc-plate" />
            <text x={450} y={314 - k * 40} textAnchor="middle" className="sc-big">
              {p.v}
            </text>
          </g>
        </g>
      ))}

      {/* 取り出して計算 */}
      <g className="sc-fade" style={shown(!!s.popped)}>
        <text x={200} y={230} textAnchor="middle" className="sc-small">
          上から2枚取り出して計算し、結果を積む
        </text>
        <text x={200} y={268} textAnchor="middle" className="sc-big">
          {s.popped ?? ''}
        </text>
        <path d="M 300 262 H 360" className="sc-accent-stroke" markerEnd="url(#sc-arrow)" />
      </g>
      <g className="sc-fade" style={shown(beat === 6)}>
        <text x={200} y={240} textAnchor="middle" className="sc-big">
          答え 14
        </text>
        <text x={200} y={272} textAnchor="middle" className="sc-small">
          あとから積んだ皿が先に出る（LIFO）
        </text>
      </g>
      <defs>
        <marker id="sc-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-accent" />
        </marker>
      </defs>
    </g>
  )
}

export const stackScene: Scene = {
  label: '皿を積む箱（スタック）で「3 4 + 2 ×」を計算する',
  Stage,
  beats: [
    { say: '「3 4 + 2 ×」は (3+4)×2 を、記号をうしろに書く形（逆ポーランド記法）で書いたものです。皿を積む箱を使って、左から読んでいきます。' },
    { say: '数が来たら、皿に書いて箱に積みます（プッシュ）。まず 3。' },
    { say: '次も数なので、4 を上に積みます。' },
    { say: '記号 + が来たら、上から2枚（4 と 3）を取り出して計算し（ポップ）、答えの 7 を積み直します。', formula: '3 + 4 = 7' },
    { say: '数の 2 を積みます。' },
    { say: '記号 × が来たので、上から 2 と 7 を取り出してかけ算し、14 を積みます。', formula: '7 × 2 = 14' },
    { say: '式を読み終えると、箱に残った1枚が答えです。あとから積んだものが先に出る、この入れ物をスタック（LIFO）といいます。', formula: '(3 + 4) × 2 = 14' },
  ],
}
