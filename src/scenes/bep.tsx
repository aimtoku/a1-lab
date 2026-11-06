import type { Scene } from './types'
import { growY, shown } from './parts'

/** 場面ごとの売上（万円） */
const SALES = [0, 100, 500, 750, 1000]
const FIXED = 300
const RATE = 0.4

/** バケツ（固定費 300万円）の位置と大きさ */
const BX = 340
const BY = 80
const BW = 150
const BH = 200

function Stage({ beat }: { beat: number }) {
  const sales = SALES[beat]!
  const margin = sales * RATE
  const fill = Math.min(margin, FIXED) / FIXED
  const over = Math.max(margin - FIXED, 0)
  const full = margin >= FIXED
  return (
    <g>
      {/* 売上の棒：変動費（灰）と、残る分（緑） */}
      <text x={40} y={60} className="sc-title">
        売上 {sales}万円
      </text>
      <g className="sc-fade" style={shown(sales > 0)}>
        <rect x={40} y={110} width={60} height={120} className="sc-off sc-growy" style={growY(sales / 1000)} />
        <rect x={110} y={150} width={60} height={80} className="sc-margin sc-growy" style={growY(sales / 1000)} />
      </g>
      <text x={70} y={256} textAnchor="middle" className="sc-small">
        材料費など
      </text>
      <text x={70} y={272} textAnchor="middle" className="sc-small">
        （変動費 60%）
      </text>
      <text x={140} y={256} textAnchor="middle" className="sc-small">
        残る分
      </text>
      <text x={140} y={272} textAnchor="middle" className="sc-small">
        （40%）
      </text>
      <g className="sc-fade" style={shown(sales > 0)}>
        <text x={70} y={300} textAnchor="middle" className="sc-text">
          {Math.round(sales * 0.6)}
        </text>
        <text x={140} y={300} textAnchor="middle" className="sc-text sc-ok-text">
          {Math.round(margin)}
        </text>
        <path d="M 180 190 C 240 190 260 150 322 150" className="sc-flow" markerEnd="url(#sc-flow-arrow)" />
      </g>

      {/* 固定費のバケツ */}
      <text x={BX + BW / 2} y={BY - 20} textAnchor="middle" className="sc-title">
        固定費のバケツ（300万円）
      </text>
      <rect x={BX} y={BY} width={BW} height={BH} className="sc-margin sc-growy" style={growY(fill)} />
      <path d={`M ${BX} ${BY} V ${BY + BH} H ${BX + BW} V ${BY}`} className="sc-box" />
      <text x={BX + BW / 2} y={BY + BH + 26} textAnchor="middle" className="sc-big">
        {Math.round(Math.min(margin, FIXED))} / 300
      </text>
      <g className="sc-fade" style={shown(beat === 0)}>
        <text x={BX + BW / 2} y={BY + BH / 2} textAnchor="middle" className="sc-text">
          家賃・人件費など
        </text>
        <text x={BX + BW / 2} y={BY + BH / 2 + 22} textAnchor="middle" className="sc-small">
          売れなくてもかかる
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={BX + BW / 2} y={BY + 40} textAnchor="middle" className="sc-big">
          ちょうど満杯
        </text>
        <text x={BX + BW / 2} y={BY + 66} textAnchor="middle" className="sc-text">
          利益 0 ＝ 損益分岐点
        </text>
      </g>

      {/* あふれた分＝利益 */}
      <g className="sc-fade" style={shown(full && over > 0)}>
        <path d={`M ${BX + BW} ${BY + 4} q 30 10 40 60`} className="sc-flow" />
        <rect x={BX + BW + 20} y={BY + 100} width={80} height={100} rx={6} className="sc-panel" />
        <rect x={BX + BW + 20} y={BY + 100} width={80} height={100} rx={6} className="sc-profit sc-growy" style={growY(over / 150)} />
        <text x={BX + BW + 60} y={BY + 72} textAnchor="middle" className="sc-title sc-ok-text">
          あふれた分
        </text>
        <text x={BX + BW + 60} y={BY + 92} textAnchor="middle" className="sc-title sc-ok-text">
          ＝ 利益
        </text>
        <text x={BX + BW + 60} y={BY + 226} textAnchor="middle" className="sc-big sc-ok-text">
          {Math.round(over)}
        </text>
      </g>
      <defs>
        <marker id="sc-flow-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-ok" />
        </marker>
      </defs>
    </g>
  )
}

export const bepScene: Scene = {
  label: '固定費をバケツにたとえ、売上から残る分でバケツが満杯になる売上（損益分岐点）を見る',
  Stage,
  beats: [
    { say: 'お店には、売れても売れなくてもかかるお金（固定費）が 300万円あります。これを大きさ 300 のバケツにたとえます。' },
    {
      say: '100万円売ると、材料費など（変動費）に 60万円かかり、残る 40万円がバケツに入ります。この残る分を「限界利益」といいます。',
      formula: '100 − 60 = 40（限界利益率 0.4）',
    },
    { say: '500万円売れば 200万円がたまります。まだバケツは満杯ではないので、赤字です。', formula: '500 × 0.4 = 200 ＜ 300' },
    {
      say: '750万円売ると、ちょうど 300万円で満杯。もうけも損もない、この売上が「損益分岐点」です。',
      formula: '損益分岐点 = 固定費 ÷ 限界利益率 = 300 ÷ 0.4 = 750',
    },
    { say: 'それ以上売れると、バケツからあふれた分が利益になります。1000万円売れば 100万円の利益です。', formula: '1000 × 0.4 − 300 = 100' },
  ],
}
