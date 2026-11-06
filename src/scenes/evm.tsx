import type { Scene } from './types'
import { grow, shown } from './parts'

const X0 = 140
const K = 2

function Bar({ y, label, value, tone, on, note }: { y: number; label: string; value: number; tone: string; on: boolean; note: string }) {
  return (
    <g className="sc-fade" style={shown(on)}>
      <text x={X0 - 12} y={y + 18} textAnchor="end" className="sc-title">
        {label}
      </text>
      <text x={X0 - 12} y={y + 36} textAnchor="end" className="sc-small">
        {note}
      </text>
      <rect x={X0} y={y} width={value * K} height={34} rx={6} className={`${tone} sc-grow`} style={grow(on ? 1 : 0)} />
      <text x={X0 + value * K + 8} y={y + 23} className="sc-title">
        {value}万円
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {/* 予算の全体 */}
      <rect x={X0} y={40} width={200 * K} height={34} rx={6} className="sc-off" />
      <text x={X0 - 12} y={62} textAnchor="end" className="sc-title">
        BAC
      </text>
      <text x={X0 + 100 * K} y={63} textAnchor="middle" className="sc-small">
        全体の予算 200万円
      </text>
      <Bar y={100} label="PV" note="予定" value={100} tone="sc-bar" on={beat >= 1} />
      <Bar y={160} label="EV" note="できた分" value={80} tone="sc-margin" on={beat >= 2} />
      <Bar y={220} label="AC" note="使ったお金" value={90} tone="sc-invest" on={beat >= 3} />
      <line x1={X0 + 100 * K} y1={90} x2={X0 + 100 * K} y2={264} className="sc-grid" strokeDasharray="4 4" />

      <g className="sc-fade" style={shown(beat === 2)}>
        <text x={X0 + 120} y={316} textAnchor="middle" className="sc-big sc-ng-text">
          SV = EV − PV = −20 → 遅れ
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={X0 + 120} y={316} textAnchor="middle" className="sc-big sc-ng-text">
          CV = EV − AC = −10 → 使いすぎ
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <rect x={X0} y={280} width={225 * K} height={30} rx={6} className="sc-off" />
        <rect x={X0 + 200 * K} y={280} width={25 * K} height={30} rx={6} className="sc-tag-ng" />
        <text x={X0 - 12} y={300} textAnchor="end" className="sc-title">
          見込み
        </text>
        <text x={X0 + 100 * K} y={300} textAnchor="middle" className="sc-small">
          このままだと 225万円
        </text>
        <text x={X0 + 212 * K} y={334} textAnchor="middle" className="sc-title sc-ng-text">
          25万円 超過
        </text>
      </g>
    </g>
  )
}

export const evmScene: Scene = {
  label: '予算200万円のうち、予定・できた分・使ったお金の3本の棒を比べる（EVM）',
  Stage,
  beats: [
    { say: '全体の予算（BAC）200万円 のプロジェクトの、10日目の様子を調べます。EVM は、仕事の量もお金に直して、3本の棒で比べる方法です。' },
    { say: 'PV（予定）：10日目までに終えるはずだった仕事は、予算にして 100万円分 です。' },
    {
      say: 'EV（できた分）：実際に終わった仕事を予算で数えると 80万円分。予定より 20万円分 遅れています。',
      formula: 'SV = EV − PV = 80 − 100 = −20（マイナスは遅れ）',
    },
    {
      say: 'AC（使ったお金）：その 80万円分 の仕事に、実際は 90万円 かかりました。予算より 10万円 使いすぎです。',
      formula: 'CV = EV − AC = 80 − 90 = −10（マイナスは超過）',
    },
    {
      say: '今の効率（80万円分 を 90万円 でやる）が続くと、全体では 225万円 かかる見込みです。25万円 の超過なので、対策が必要です。',
      formula: 'CPI = 80 ÷ 90 ≒ 0.89、見込み = 200 ÷ 0.89 ≒ 225万円',
    },
  ],
}
