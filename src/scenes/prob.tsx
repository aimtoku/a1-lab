import type { Scene } from './types'
import { at, shown } from './parts'

/** 袋の中の玉：赤3・白2 */
const BALLS = ['赤1', '赤2', '赤3', '白1', '白2'] as const
const isRed = (i: number) => i < 3

/** 2個の取り出し方（10通り） */
const PAIRS: readonly (readonly [number, number])[] = (() => {
  const out: [number, number][] = []
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) out.push([a, b])
  return out
})()

function Ball({ x, y, i, r = 16, label = true }: { x: number; y: number; i: number; r?: number; label?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} className={isRed(i) ? 'sc-red' : 'sc-white'} />
      {label && (
        <text x={x} y={y + 4} textAnchor="middle" className={isRed(i) ? 'sc-ball-label-red' : 'sc-ball-label'}>
          {BALLS[i]!.slice(1)}
        </text>
      )}
    </g>
  )
}

/** 袋。中に玉を描く */
function Bag({ x, y, balls, title }: { x: number; y: number; balls: readonly number[]; title: string }) {
  const pos = [
    [-35, 8],
    [0, 8],
    [35, 8],
    [-18, 42],
    [18, 42],
  ]
  return (
    <g>
      <path d={`M ${x - 62} ${y - 20} Q ${x - 80} ${y + 90} ${x} ${y + 92} Q ${x + 80} ${y + 90} ${x + 62} ${y - 20} Z`} className="sc-bag" />
      <path d={`M ${x - 62} ${y - 20} Q ${x} ${y - 38} ${x + 62} ${y - 20}`} className="sc-bag-tie" />
      {balls.map((b, k) => (
        <Ball key={b} x={x + pos[k]![0]!} y={y + pos[k]![1]!} i={b} />
      ))}
      <text x={x} y={y + 118} textAnchor="middle" className="sc-title">
        {title}
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const showCards = beat === 1 || beat === 2 || beat === 4
  const showTree = beat === 3
  return (
    <g>
      <g className="sc-move" style={{ ...at(beat === 3 ? -200 : 0, 0), ...shown(beat !== 3) }}>
        <Bag x={110} y={130} balls={[0, 1, 2, 3, 4]} title="赤3個・白2個" />
        <text x={110} y={60} textAnchor="middle" className="sc-small">
          ここから2個取り出す
        </text>
      </g>

      {/* 取り出し方を全部並べる（10通り） */}
      <g className="sc-fade" style={shown(showCards)}>
        <text x={420} y={46} textAnchor="middle" className="sc-title">
          2個の取り出し方は全部で 10通り
        </text>
        {PAIRS.map(([a, b], k) => {
          const col = k % 5
          const row = Math.floor(k / 5)
          const both = isRed(a) && isRed(b)
          const hot = beat === 2 ? both : beat === 4 ? !both : false
          const dim = (beat === 2 && !both) || (beat === 4 && both)
          return (
            <g key={k} className="sc-move" style={{ ...at(234 + col * 76, 70 + row * 92), ...shown(true, dim) }}>
              <rect x={0} y={0} width={66} height={70} rx={10} className={`sc-color ${hot ? (beat === 2 ? 'sc-hot' : 'sc-tag-ok') : 'sc-panel'}`} />
              <Ball x={20} y={35} i={a} r={14} />
              <Ball x={46} y={35} i={b} r={14} />
            </g>
          )
        })}
        <g className="sc-fade" style={shown(beat === 2)}>
          <text x={420} y={290} textAnchor="middle" className="sc-big">
            両方 赤 は 3通り → 3/10
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 4)}>
          <text x={420} y={290} textAnchor="middle" className="sc-big">
            白が1個以上 は 7通り → 7/10
          </text>
          <text x={420} y={318} textAnchor="middle" className="sc-small">
            「両方 赤」以外のすべて ＝ 1 − 3/10
          </text>
        </g>
      </g>

      {/* 順番に1個ずつ取る見方 */}
      <g className="sc-fade" style={shown(showTree)}>
        <Bag x={140} y={120} balls={[0, 1, 2, 3, 4]} title="1個目：赤は 5個中 3個" />
        <text x={320} y={160} textAnchor="middle" className="sc-big">
          →
        </text>
        <Bag x={480} y={120} balls={[1, 2, 3, 4]} title="2個目：残り 4個中 赤 2個" />
        <g className="sc-move" style={at(0, 0)}>
          <Ball x={320} y={120} i={0} r={18} />
          <text x={320} y={92} textAnchor="middle" className="sc-small">
            赤を1個取った
          </text>
        </g>
        <text x={320} y={318} textAnchor="middle" className="sc-big">
          3/5 × 2/4 = 6/20 = 3/10
        </text>
      </g>
    </g>
  )
}

export const probScene: Scene = {
  label: '赤3個・白2個の袋から2個取り出す確率',
  Stage,
  beats: [
    { say: '袋に赤い玉が3個、白い玉が2個入っています。中を見ずに2個いっしょに取り出すとき、2個とも赤になる確率を考えます。' },
    { say: '取り出し方を全部並べると 10通りあります。5個から2個を選ぶ「組合せ」の数です。', formula: '5C2 = (5×4)÷(2×1) = 10' },
    { say: '10通りのうち、2個とも赤なのは 3通りです。確率は「当たりの数 ÷ 全部の数」なので 3/10 です。', formula: '3C2 ÷ 5C2 = 3/10' },
    {
      say: '1個ずつ順に取ると考えても同じです。1個目が赤の確率は 3/5、残り4個から2個目も赤の確率は 2/4。続けて起きる確率は掛け算します。',
      formula: '3/5 × 2/4 = 3/10',
    },
    { say: '「白が1個以上」は「両方 赤」以外の全部です。全体の 1 から引けば、数えなくても求められます（余事象）。', formula: '1 − 3/10 = 7/10' },
  ],
}
