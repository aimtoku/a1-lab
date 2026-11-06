import type { Scene } from './types'
import { at, shown } from './parts'

const DATA = [3, 8, 12, 17, 23, 31, 42, 56]

interface State {
  lo: number
  hi: number
  mid?: number
  /** 線形探索で、何番まで見たか */
  linear?: number
  found?: boolean
}

const STATES: readonly State[] = [
  { lo: 0, hi: 7 },
  { lo: 0, hi: 7, mid: 3 },
  { lo: 4, hi: 7, mid: 5 },
  { lo: 4, hi: 4, mid: 4, found: true },
  { lo: 0, hi: 7, linear: 4 },
]

const X0 = 40
const DX = 72

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  const linear = s.linear !== undefined
  return (
    <g>
      <text x={320} y={40} textAnchor="middle" className="sc-title">
        小さい順に並んだ8枚のカードから 23 を探す
      </text>
      {DATA.map((v, i) => {
        const inRange = linear || (i >= s.lo && i <= s.hi)
        const isMid = !linear && s.mid === i
        const seen = linear && i <= s.linear!
        const hit = (s.found && i === 4) || (linear && i === 4)
        return (
          <g key={v} className="sc-move" style={shown(true, !inRange)}>
            <rect x={X0 + i * DX} y={110} width={60} height={80} rx={8} className={`sc-color ${hit ? 'sc-tag-ok' : isMid || seen ? 'sc-hot' : 'sc-panel'}`} />
            <text x={X0 + i * DX + 30} y={158} textAnchor="middle" className="sc-big">
              {v}
            </text>
            <text x={X0 + i * DX + 30} y={210} textAnchor="middle" className="sc-small">
              {i}番
            </text>
          </g>
        )
      })}
      {/* 真ん中を指す */}
      <g className="sc-move" style={{ ...at(X0 + (s.mid ?? 0) * DX + 30, 0), ...shown(s.mid !== undefined && !linear) }}>
        <path d="M 0 100 l -9 -14 h 18 Z" className="sc-accent" />
        <text x={0} y={76} textAnchor="middle" className="sc-title">
          真ん中
        </text>
      </g>
      {/* 線形探索の指 */}
      <g className="sc-fade" style={shown(linear)}>
        <path d={`M ${X0 + 30} 236 H ${X0 + 4 * DX + 30}`} className="sc-accent-stroke" markerEnd="url(#sc-bs-arrow)" />
        <text x={X0 + 2 * DX + 30} y={262} textAnchor="middle" className="sc-small">
          先頭から1枚ずつ
        </text>
      </g>
      <defs>
        <marker id="sc-bs-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-accent" />
        </marker>
      </defs>
      <g className="sc-fade" style={shown(beat === 1)}>
        <text x={320} y={280} textAnchor="middle" className="sc-big">
          23 ＞ 17 → 右半分だけ残す
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <text x={320} y={280} textAnchor="middle" className="sc-big">
          23 ＜ 31 → 左側だけ残す
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={320} y={280} textAnchor="middle" className="sc-big sc-ok-text">
          見つかった！ 比べたのは3回
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={320} y={310} textAnchor="middle" className="sc-big">
          線形探索は5回 ／ 2分探索は3回
        </text>
      </g>
    </g>
  )
}

export const binsearchScene: Scene = {
  label: '小さい順に並んだ8枚のカードから、真ん中と比べて半分ずつ絞り込んで 23 を探す',
  Stage,
  beats: [
    { say: '小さい順に並んだ8枚のカードから、23 を探します。辞書を引くときのように、真ん中を開いて、前か後ろかを決めていきます。' },
    { say: '真ん中（3番）のカードは 17。23 は 17 より大きいので、左半分にはありません。右半分だけを残します。', formula: '(0 + 7) ÷ 2 = 3.5 → 3番' },
    { say: '残りの真ん中（5番）は 31。23 は 31 より小さいので、その左側だけを残します。', formula: '(4 + 7) ÷ 2 = 5.5 → 5番' },
    { say: '残った4番が 23 で、見つかりました。1回比べるたびに候補が半分になるので、3回で済みました。' },
    {
      say: '先頭から1枚ずつ見る線形探索だと、5回かかります。カードが多いほど、2分探索との差は大きくなります。',
      formula: '最大の比較回数：2分探索 log₂8 + 1 = 4回 ／ 線形探索 8回',
    },
  ],
}
