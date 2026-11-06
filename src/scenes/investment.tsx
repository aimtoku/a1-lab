import type { Scene } from './types'
import { growY, shown } from './parts'

const YEARS = [
  { y: 1, gain: 100, pv: 90.9 },
  { y: 2, gain: 120, pv: 99.2 },
  { y: 3, gain: 150, pv: 112.7 },
]
const BASE = 320
const K = 0.55
const X0 = 120

function Stage({ beat }: { beat: number }) {
  const stacked = beat === 1 || beat === 2
  const disc = beat >= 3
  let acc = 0
  return (
    <g>
      <line x1={60} y1={BASE} x2={600} y2={BASE} className="sc-line" />
      {/* 投資額 */}
      <rect x={60} y={BASE - 300 * K} width={40} height={300 * K} rx={4} className="sc-invest" />
      <text x={80} y={BASE + 20} textAnchor="middle" className="sc-small">
        投資
      </text>
      <text x={80} y={BASE - 300 * K - 8} textAnchor="middle" className="sc-title sc-ng-text">
        300
      </text>
      <line x1={60} y1={BASE - 300 * K} x2={600} y2={BASE - 300 * K} className="sc-red-stroke" strokeDasharray="6 6" strokeWidth={2} />
      <text x={108} y={BASE - 300 * K - 8} className="sc-small">
        ← 取り戻したい額 300万円
      </text>

      {YEARS.map((y, i) => {
        const v = disc ? y.pv : y.gain
        const bottom = stacked ? acc : 0
        acc += y.gain
        const x = stacked ? X0 + 60 + i * 120 : X0 + 40 + i * 150
        return (
          <g key={y.y} className="sc-move" style={{ transform: `translate(${x}px, ${-bottom * K}px)` }}>
            <rect x={0} y={BASE - y.gain * K} width={70} height={y.gain * K} rx={4} className={`sc-gain sc-growy`} style={growY(v / y.gain)} />
            <text x={35} y={BASE - v * K - 8} textAnchor="middle" className="sc-title">
              {v}
            </text>
            <text x={35} y={BASE + 20 + bottom * K} textAnchor="middle" className="sc-small">
              {y.y}年目
            </text>
          </g>
        )
      })}
      <g className="sc-fade" style={shown(beat === 1)}>
        <text x={330} y={40} textAnchor="middle" className="sc-big">
          累計 100 → 220 → 370：3年目の途中で 300 を超える
        </text>
        <text x={330} y={70} textAnchor="middle" className="sc-text">
          回収期間は 約 2.5年
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <text x={330} y={40} textAnchor="middle" className="sc-big">
          増えた分 370 − 300 = 70
        </text>
        <text x={330} y={70} textAnchor="middle" className="sc-text">
          ROI = 70 ÷ 300 ≒ 23%
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={360} y={50} textAnchor="middle" className="sc-text">
          先の年ほど、今の価値に直すと小さくなる（÷1.1 を年の数だけ）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={360} y={40} textAnchor="middle" className="sc-big">
          今の価値の合計 302.8 − 300 = 2.8
        </text>
        <text x={360} y={70} textAnchor="middle" className="sc-title sc-ok-text">
          NPV がプラス → 投資する価値あり
        </text>
      </g>
    </g>
  )
}

export const investmentScene: Scene = {
  label: '300万円の投資と、3年間の利益の棒を積み上げ、今の価値に直して比べる（回収期間・ROI・NPV）',
  Stage,
  beats: [
    { say: '300万円でシステムを入れると、1年目 100万円、2年目 120万円、3年目 150万円 の利益が見込めます。この投資が得かどうかを、3つの見方で調べます。' },
    {
      say: '回収期間：利益を積み上げていき、投資の 300万円 に届くまでの期間です。3年目の途中で届くので、約 2.5年 です。',
      formula: '100 + 120 = 220、残り 80 ÷ 150 ≒ 0.5年',
    },
    { say: 'ROI：投資に対して、どれだけ増えたか。3年の合計 370万円 から投資を引いた 70万円 を、投資額で割ります。', formula: '(370 − 300) ÷ 300 ≒ 23%' },
    {
      say: 'NPV：今の 100万円 と 1年後の 100万円 は同じではありません。利率 10% なら、今の 90.9万円 を預ければ1年後に 100万円 になります。先の利益ほど、今の価値に直すと小さくなります。',
      formula: '100 ÷ 1.1 ≒ 90.9、120 ÷ 1.1² ≒ 99.2、150 ÷ 1.1³ ≒ 112.7',
    },
    {
      say: '今の価値の合計 302.8万円 から投資の 300万円 を引くと、プラス 2.8万円。プラスなので投資する価値ありと判断します。単純な合計（370万円）よりずっと小さい点に注意します。',
      formula: 'NPV = 302.8 − 300 ≒ 2.8万円',
    },
  ],
}
