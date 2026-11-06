import type { Scene } from './types'
import { shown } from './parts'

const STAGES = ['取出し', '解読', '実行', '書込み'] as const
const TONES = ['sc-st-1', 'sc-st-2', 'sc-st-3', 'sc-st-4'] as const

/** 命令ごとの開始サイクル（0から）。null は捨てた命令 */
interface Run {
  row: number
  start: number
  /** 途中で捨てる（何段目まで進んだか） */
  cut?: number
}

const LAYOUTS: readonly { runs: readonly Run[]; end: number; cols: number }[] = [
  { runs: [], end: 0, cols: 16 },
  {
    runs: [0, 4, 8, 12].map((s, i) => ({ row: i, start: s })),
    end: 16,
    cols: 16,
  },
  { runs: [0, 1].map((s, i) => ({ row: i, start: s })), end: 0, cols: 9 },
  { runs: [0, 1, 2, 3].map((s, i) => ({ row: i, start: s })), end: 7, cols: 9 },
  {
    runs: [
      { row: 0, start: 0 },
      { row: 1, start: 1 },
      { row: 2, start: 2, cut: 2 },
      { row: 2, start: 4 },
      { row: 3, start: 5 },
    ],
    end: 9,
    cols: 9,
  },
]

function Stage({ beat }: { beat: number }) {
  const l = LAYOUTS[beat]!
  const X0 = 110
  const W = 500 / l.cols
  return (
    <g>
      {/* 4つの段（洗濯にたとえると：洗う・すすぐ・干す・たたむ） */}
      {STAGES.map((st, i) => (
        <g key={st}>
          <rect x={110 + i * 128} y={16} width={118} height={34} rx={17} className={TONES[i]} />
          <text x={169 + i * 128} y={39} textAnchor="middle" className="sc-text">
            {i + 1}. {st}
          </text>
        </g>
      ))}
      {Array.from({ length: l.cols + 1 }, (_, c) => (
        <g key={`${l.cols}-${c}`}>
          <line x1={X0 + c * W} y1={70} x2={X0 + c * W} y2={274} className="sc-grid" />
          {c < l.cols && (
            <text x={X0 + c * W + W / 2} y={292} textAnchor="middle" className="sc-small">
              {c + 1}
            </text>
          )}
        </g>
      ))}
      <text x={X0 - 12} y={292} textAnchor="end" className="sc-small">
        サイクル
      </text>
      {[0, 1, 2, 3].map((r) => (
        <text key={r} x={X0 - 12} y={100 + r * 50} textAnchor="end" className="sc-title">
          命令{r + 1}
        </text>
      ))}
      {l.runs.map((run, k) =>
        STAGES.map((_, s) => {
          if (run.cut !== undefined && s >= run.cut) return null
          return (
            <g key={`${beat}-${k}-${s}`} className="sc-pop" style={{ animationDelay: `${(run.start + s) * 0.25}s` }}>
              <rect
                x={X0 + (run.start + s) * W + 2}
                y={78 + run.row * 50}
                width={W - 4}
                height={36}
                rx={5}
                className={run.cut !== undefined ? 'sc-off' : TONES[s]}
              />
              {run.cut !== undefined && (
                <text x={X0 + (run.start + s) * W + W / 2} y={102 + run.row * 50} textAnchor="middle" className="sc-title sc-ng-text">
                  ×
                </text>
              )}
            </g>
          )
        }),
      )}
      <g className="sc-fade" style={shown(l.end > 0)}>
        <line x1={X0 + l.end * W} y1={64} x2={X0 + l.end * W} y2={334} className="sc-red-stroke" />
        <text x={X0 + l.end * W - 8} y={326} textAnchor="end" className="sc-big sc-ng-text">
          {l.end}サイクル
        </text>
      </g>
    </g>
  )
}

export const pipelineScene: Scene = {
  label: '命令の4つの段を、洗濯のように1つずつずらして重ねる（パイプライン）',
  Stage,
  beats: [
    { say: '命令は「取出し → 解読 → 実行 → 書込み」の4段で処理します。洗濯の「洗う → すすぐ → 干す → たたむ」と同じで、段ごとに別の道具を使います。' },
    {
      say: '1つの命令が4段を全部終えてから次を始めると、そのあいだ他の道具は遊んでいます。4命令で 16サイクルかかります。',
      formula: '4命令 × 4段 = 16サイクル',
    },
    { say: '命令1を解読しているあいだに、空いた「取出し」で命令2を取り出します。1サイクルずつずらして重ねるのがパイプラインです。' },
    {
      say: '4命令を重ねると、全体は 7サイクルで終わります。最初の命令に4サイクル、そのあとは1サイクルごとに1つずつ終わります。',
      formula: '4段 + (4命令 − 1) = 7サイクル',
    },
    {
      say: '命令2が分岐命令で、行き先が実行まで決まらないと、先に取り出した命令3は捨てて（×）取り出し直しです。この乱れをハザードといい、時間が延びます。',
      formula: '7サイクル → 9サイクル',
    },
  ],
}
