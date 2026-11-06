import type { Scene } from './types'
import { shown } from './parts'

/** 自転車（製品X）。車輪が部品Y */
function Bike({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-30} cy={0} r={22} className="sc-wheel" />
      <circle cx={30} cy={0} r={22} className="sc-wheel" />
      <path d="M -30 0 L -6 -30 H 22 L 30 0 M -6 -30 L 4 0 L 22 -30 M 22 -30 L 18 -42 M -10 -36 H 2" className="sc-frame" />
    </g>
  )
}

const BAR_X = 220
const UNIT = 2

function Stage({ beat }: { beat: number }) {
  const cal = beat >= 4
  return (
    <g>
      <g className="sc-fade" style={shown(!cal)}>
        <Bike x={90} y={110} />
        <text x={90} y={160} textAnchor="middle" className="sc-title">
          製品X（自転車）
        </text>
        <text x={90} y={182} textAnchor="middle" className="sc-small">
          1台に 部品Y（車輪）2個
        </text>
        <g className="sc-fade" style={shown(beat === 0)}>
          <text x={380} y={110} textAnchor="middle" className="sc-big">
            製品X を 100台 作る計画
          </text>
          <text x={380} y={150} textAnchor="middle" className="sc-text">
            部品Y を、いくつ・いつ 注文すればよい？
          </text>
        </g>

        {/* 総所要量の棒 */}
        <g className="sc-fade" style={shown(beat >= 1)}>
          <text x={BAR_X} y={60} className="sc-title">
            必要な車輪：100台 × 2 = 200個（総所要量）
          </text>
          <rect x={BAR_X} y={74} width={200 * UNIT} height={40} rx={6} className="sc-bar" />
        </g>
        <g className="sc-fade" style={shown(beat >= 2)}>
          <rect x={BAR_X} y={130} width={50 * UNIT} height={40} rx={6} className="sc-off" />
          <text x={BAR_X + 25 * UNIT} y={190} textAnchor="middle" className="sc-small">
            在庫 50
          </text>
          <rect x={BAR_X + 50 * UNIT} y={130} width={30 * UNIT} height={40} rx={6} className="sc-off" />
          <text x={BAR_X + 65 * UNIT} y={190} textAnchor="middle" className="sc-small">
            届く予定 30
          </text>
        </g>
        <g className="sc-fade" style={shown(beat >= 3)}>
          <rect x={BAR_X + 80 * UNIT} y={130} width={120 * UNIT} height={40} rx={6} className="sc-hot" />
          <text x={BAR_X + 140 * UNIT} y={156} textAnchor="middle" className="sc-title">
            足りない 120個 → 注文
          </text>
          <text x={320} y={250} textAnchor="middle" className="sc-big">
            200 − 50 − 30 = 120個（正味所要量）
          </text>
        </g>
      </g>

      {/* カレンダー */}
      <g className="sc-fade" style={shown(cal)}>
        <text x={320} y={50} textAnchor="middle" className="sc-title">
          注文してから届くまで 5日。製品X を 10日 から作り始める
        </text>
        {Array.from({ length: 10 }, (_, i) => {
          const d = i + 1
          const tone = d === 10 ? 'sc-tag-ok' : d === 5 ? 'sc-hot' : d > 5 ? 'sc-wait-day' : 'sc-panel'
          return (
            <g key={d}>
              <rect x={40 + i * 57} y={90} width={51} height={60} rx={8} className={tone} />
              <text x={65 + i * 57} y={128} textAnchor="middle" className="sc-big">
                {d}
              </text>
            </g>
          )
        })}
        <text x={65 + 9 * 57} y={176} textAnchor="middle" className="sc-small">
          作り始め
        </text>
        <text x={65 + 4 * 57} y={176} textAnchor="middle" className="sc-title sc-ng-text">
          ここで注文
        </text>
        <path d={`M ${65 + 9 * 57} 200 H ${65 + 4 * 57}`} className="sc-accent-stroke" markerEnd="url(#sc-mrp-arrow)" />
        <text x={65 + 6.5 * 57} y={226} textAnchor="middle" className="sc-small">
          5日さかのぼる
        </text>
        <defs>
          <marker id="sc-mrp-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-accent" />
          </marker>
        </defs>
        <text x={320} y={290} textAnchor="middle" className="sc-big sc-ok-text">
          5日までに 120個 を注文する
        </text>
      </g>
    </g>
  )
}

export const mrpScene: Scene = {
  label: '自転車100台に必要な車輪の数から、在庫と届く予定を引き、使う日からさかのぼって注文する日を決める（MRP）',
  Stage,
  beats: [
    { say: '製品X を自転車、部品Y を車輪にたとえます。自転車1台に車輪は2個。自転車を 100台作る計画から、車輪の注文を決めます。' },
    { say: 'まず、全部でいくつ要るか。100台 × 2個 = 200個 です（総所要量）。', formula: '100 × 2 = 200' },
    { say: '倉庫に在庫が 50個、すでに注文していて届く予定のもの（発注残）が 30個 あります。' },
    { say: '足りないのは 120個 だけです（正味所要量）。これを注文します。', formula: '200 − 50 − 30 = 120' },
    { say: '車輪は注文から届くまで 5日 かかります。10日に作り始めるなら、5日さかのぼって 5日までに注文します。', formula: '10日 − 5日 = 5日に注文' },
  ],
}
