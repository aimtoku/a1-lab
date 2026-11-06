import type { Scene } from './types'
import { shown } from './parts'

/** グラフ：横 0〜20日、縦 0〜320個 */
const GX = (d: number) => 60 + d * 24
const GY = (v: number) => 300 - v * 0.75

/** 在庫の動き（13.5日目に 300個 届く） */
const PATH = `M ${GX(0)} ${GY(300)} L ${GX(13.5)} ${GY(30)} L ${GX(13.5)} ${GY(330)} L ${GX(20)} ${GY(200)}`

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      <line x1={GX(0)} y1={GY(0)} x2={GX(20)} y2={GY(0)} className="sc-line" />
      <line x1={GX(0)} y1={GY(0)} x2={GX(0)} y2={GY(330)} className="sc-line" />
      {[0, 5, 10, 15, 20].map((d) => (
        <text key={d} x={GX(d)} y={GY(0) + 20} textAnchor="middle" className="sc-small">
          {d}日
        </text>
      ))}
      {[0, 100, 200, 300].map((v) => (
        <text key={v} x={GX(0) - 8} y={GY(v) + 4} textAnchor="end" className="sc-small">
          {v}
        </text>
      ))}
      <text x={GX(0)} y={GY(330) - 6} textAnchor="middle" className="sc-small">
        在庫（個）
      </text>

      {/* 安全在庫と発注点 */}
      <g className="sc-fade" style={shown(beat >= 2)}>
        <rect x={GX(0)} y={GY(30)} width={GX(20) - GX(0)} height={GY(0) - GY(30)} className="sc-safety" />
        <text x={GX(20) + 4} y={GY(15) + 4} className="sc-small">
          安全在庫 30
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 2)}>
        <line x1={GX(0)} y1={GY(130)} x2={GX(20)} y2={GY(130)} className="sc-red-stroke" strokeDasharray="8 6" />
        <text x={GX(20) + 4} y={GY(130) + 4} className="sc-title sc-ng-text">
          発注点 130
        </text>
      </g>

      {/* 在庫の線：場面ごとに見える範囲を広げる */}
      <clipPath id="sc-ro-clip">
        <rect x={0} y={0} height={360} className="sc-clip" style={{ width: `${beat === 0 ? GX(4) : beat < 3 ? GX(8.5) : GX(20)}px` }} />
      </clipPath>
      <path d={PATH} className="sc-stock" clipPath="url(#sc-ro-clip)" />

      <g className="sc-fade" style={shown(beat === 1)}>
        <rect x={GX(8.5)} y={GY(130) - 4} width={GX(13.5) - GX(8.5)} height={GY(30) - GY(130) + 8} rx={6} className="sc-wait-day" />
        <text x={GX(13.5) + 10} y={GY(90)} className="sc-title">
          届くまでの5日で
        </text>
        <text x={GX(13.5) + 10} y={GY(90) + 20} className="sc-title">
          100個 使う
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 3)}>
        <circle cx={GX(8.5)} cy={GY(130)} r={8} className="sc-ng" />
        <text x={GX(8.5)} y={GY(130) - 16} textAnchor="middle" className="sc-title">
          ここで注文
        </text>
        <circle cx={GX(13.5)} cy={GY(30)} r={8} className="sc-ok" />
        <text x={GX(13.5) + 12} y={GY(30) - 10} className="sc-title sc-ok-text">
          届いた時に 30個 残る
        </text>
      </g>
    </g>
  )
}

export const reorderScene: Scene = {
  label: '毎日20個ずつ減る在庫のグラフで、届くまでに使う分と安全在庫から、注文する在庫の量（発注点）を決める',
  Stage,
  beats: [
    { say: '倉庫の部品は 300個。毎日 20個ずつ使うので、グラフの線は右下がりに減っていきます。どこかで注文しないと、いつか切れてしまいます。' },
    {
      say: '注文してから届くまで 5日 かかります。その5日の間にも 20 × 5 = 100個 使うので、注文するときには最低 100個 残っていないといけません。',
      formula: '20個 × 5日 = 100個',
    },
    {
      say: '使う量が急に増えたり、届くのが遅れたりしても切れないよう、予備として安全在庫 30個 を足します。在庫が 130個 になったら注文する、と決めます（発注点）。',
      formula: '発注点 = 100 + 30 = 130個',
    },
    { say: '在庫が 130個 になった日に注文すると、5日後に届いたときにも 30個 残っています。決まった量を届けてもらい、在庫が戻ります（定量発注方式）。' },
  ],
}
