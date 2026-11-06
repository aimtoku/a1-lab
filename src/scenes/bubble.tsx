import type { Scene } from './types'
import { at, shown } from './parts'

interface State {
  order: readonly number[]
  /** 比べている2つの位置 */
  cmp?: readonly [number, number]
  swap?: boolean
  /** 位置が確定した数 */
  fixed: readonly number[]
}

const STATES: readonly State[] = [
  { order: [5, 3, 8, 1], fixed: [] },
  { order: [3, 5, 8, 1], cmp: [0, 1], swap: true, fixed: [] },
  { order: [3, 5, 8, 1], cmp: [1, 2], swap: false, fixed: [] },
  { order: [3, 5, 1, 8], cmp: [2, 3], swap: true, fixed: [8] },
  { order: [3, 1, 5, 8], cmp: [1, 2], swap: true, fixed: [8, 5] },
  { order: [1, 3, 5, 8], cmp: [0, 1], swap: true, fixed: [8, 5, 3, 1] },
]

const X0 = 150
const DX = 100
const BASE = 280

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  return (
    <g>
      <line x1={120} y1={BASE} x2={540} y2={BASE} className="sc-line" />
      {[5, 3, 8, 1].map((v) => {
        const i = s.order.indexOf(v)
        const fixed = s.fixed.includes(v)
        const cmp = s.cmp?.includes(i) ?? false
        const h = v * 26
        return (
          <g key={v} className="sc-move" style={at(X0 + i * DX, 0)}>
            <rect x={-32} y={BASE - h} width={64} height={h} rx={6} className={`sc-color ${fixed ? 'sc-bar-fixed' : cmp ? 'sc-hot' : 'sc-bar'}`} />
            <text x={0} y={BASE - h - 10} textAnchor="middle" className="sc-big">
              {v}
            </text>
          </g>
        )
      })}
      {s.cmp && (
        <g className="sc-move" style={at(X0 + s.cmp[0] * DX + DX / 2, 0)}>
          <text x={0} y={312} textAnchor="middle" className={s.swap ? 'sc-title sc-ng-text' : 'sc-title sc-ok-text'}>
            {s.swap ? '⇄ 入れ替える' : 'そのまま'}
          </text>
        </g>
      )}
      <g className="sc-fade" style={shown(beat >= 3)}>
        <rect x={30} y={70} width={14} height={14} rx={3} className="sc-bar-fixed" />
        <text x={50} y={82} className="sc-small">
          位置が決まった
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={320} y={345} textAnchor="middle" className="sc-title sc-ok-text">
          完成！ 比べた回数は 3 + 2 + 1 = 6回
        </text>
      </g>
    </g>
  )
}

export const bubbleScene: Scene = {
  label: '高さの違う4本の棒を、隣どうし比べて入れ替え、小さい順に並べる（バブルソート）',
  Stage,
  beats: [
    { say: '5, 3, 8, 1 を小さい順に並べます。バブルソートは、隣どうしを比べて、左が大きければ入れ替えることを繰り返します。' },
    { say: '先頭の 5 と 3 を比べます。左の 5 が大きいので入れ替えます。' },
    { say: '次は 5 と 8。左のほうが小さいので、そのままです。' },
    { say: '8 と 1 を入れ替えると、いちばん大きい 8 が右はしに来て、位置が決まりました。泡（バブル）が浮かぶように、大きい数が端へ移ります。' },
    { say: '2周目は、決まった 8 を除いて同じことをします。3 と 5 はそのまま、5 と 1 を入れ替えて、5 の位置が決まります。' },
    {
      say: '3周目で 3 と 1 を入れ替えて完成です。比べた回数は 3 + 2 + 1 = 6回。データが n 件なら、およそ n² に比例して増えます。',
      formula: '比較回数 = n(n − 1) ÷ 2 = 4 × 3 ÷ 2 = 6',
    },
  ],
}
