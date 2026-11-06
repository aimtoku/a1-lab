import type { Scene } from './types'
import { at, shown } from './parts'

const QX = 140
const QY = 50
const QW = 220
const QH = 130

const QUADS = [
  { name: '花形', mark: '★', col: 0, row: 0, sub: '伸びる市場で強い' },
  { name: '問題児', mark: '？', col: 1, row: 0, sub: '伸びる市場で弱い' },
  { name: '金のなる木', mark: '¥', col: 0, row: 1, sub: '落ち着いた市場で強い' },
  { name: '負け犬', mark: '×', col: 1, row: 1, sub: '落ち着いた市場で弱い' },
]

/** 事業（丸）の位置：場面ごと */
const BIZ: readonly { id: string; pos: (b: number) => readonly [number, number]; gone?: (b: number) => boolean }[] = [
  { id: 'q', pos: (b) => (b >= 3 ? [QX + 150, QY + 95] : [QX + 330, QY + 95]) },
  { id: 'star', pos: () => [QX + 70, QY + 95] },
  { id: 'cow', pos: () => [QX + 70, QY + 215] },
  { id: 'dog', pos: () => [QX + 330, QY + 215], gone: (b) => b >= 4 },
]

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {QUADS.map((q) => (
        <g key={q.name} className="sc-fade" style={shown(beat >= 1)}>
          <rect x={QX + q.col * QW} y={QY + q.row * QH} width={QW} height={QH} className={`sc-quad-${q.col}${q.row}`} />
          <text x={QX + q.col * QW + 12} y={QY + q.row * QH + 24} className="sc-title">
            {q.mark} {q.name}
          </text>
          <text x={QX + q.col * QW + 12} y={QY + q.row * QH + 42} className="sc-small">
            {q.sub}
          </text>
        </g>
      ))}
      <rect x={QX} y={QY} width={QW * 2} height={QH * 2} className="sc-quad-frame" />
      <text x={QX - 10} y={QY + 20} textAnchor="end" className="sc-small">
        高い
      </text>
      <text x={QX - 10} y={QY + QH * 2} textAnchor="end" className="sc-small">
        低い
      </text>
      <text x={QX - 50} y={QY + QH} textAnchor="middle" className="sc-title" transform={`rotate(-90 ${QX - 50} ${QY + QH})`}>
        市場の成長率
      </text>
      <text x={QX} y={QY + QH * 2 + 22} className="sc-small">
        高い
      </text>
      <text x={QX + QW * 2} y={QY + QH * 2 + 22} textAnchor="end" className="sc-small">
        低い
      </text>
      <text x={QX + QW} y={QY + QH * 2 + 40} textAnchor="middle" className="sc-title">
        相対的な市場占有率（シェア）
      </text>

      {/* 事業 */}
      {BIZ.map((b) => {
        const [x, y] = b.pos(beat)
        const gone = b.gone?.(beat) ?? false
        return (
          <g key={b.id} className="sc-move" style={{ ...at(gone ? x + 120 : x, y), ...shown(beat >= 1 && !gone) }}>
            <circle r={17} className="sc-biz" />
          </g>
        )
      })}

      {/* お金の流れ */}
      <g className="sc-fade" style={shown(beat >= 2)}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={QX + 102 + i * 18} cy={QY + 222 - i * 4} r={8} className="sc-coin" />
        ))}
        <text x={QX + 40} y={QY + 250} className="sc-small">
          お金が生まれる
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 3)}>
        <path d={`M ${QX + 166} ${QY + 205} C ${QX + 260} ${QY + 170} ${QX + 300} ${QY + 130} ${QX + 316} ${QY + 112}`} className="sc-flow" />
        <path d={`M ${QX + 310} ${QY + 95} H ${QX + 176}`} className="sc-accent-stroke" markerEnd="url(#sc-ppm-arrow)" />
        <text x={QX + 250} y={QY + 80} textAnchor="middle" className="sc-small">
          育てる
        </text>
        <path d={`M ${QX + 196} ${QY + 108} V ${QY + 205}`} className="sc-accent-stroke" strokeDasharray="5 5" markerEnd="url(#sc-ppm-arrow)" />
        <text x={QX + 188} y={QY + 190} textAnchor="end" className="sc-small">
          やがて
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 4)}>
        <text x={QX + 400} y={QY + 210} textAnchor="middle" className="sc-title sc-ng-text">
          撤退 →
        </text>
      </g>
      <defs>
        <marker id="sc-ppm-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-accent" />
        </marker>
      </defs>
    </g>
  )
}

export const ppmScene: Scene = {
  label: '市場の成長率とシェアで4つの区画に分け、金のなる木のお金で問題児を花形に育てる（PPM）',
  Stage,
  beats: [
    { say: '会社がいくつもの事業を持っているとき、どこにお金を使うかを決める道具が PPM です。縦に市場の伸び（成長率）、横にシェアの強さをとります。' },
    { say: '4つの区画に分かれます。伸びる市場で強い「花形」、伸びる市場で弱い「問題児」、落ち着いた市場で強い「金のなる木」、どちらも弱い「負け犬」です。' },
    { say: '金のなる木は、もう大きな投資をしなくても、強いシェアで利益を生みます。ここが会社のお金の源です。' },
    { say: 'そのお金を問題児に注いでシェアを上げ、花形に育てます。花形は、市場の伸びが落ち着くと、次の金のなる木になります。' },
    { say: '負け犬は、お金を使い続けても取り戻しにくいので、撤退や縮小を考えます。育たないと見極めた問題児も、早めに撤退を判断します。' },
  ],
}
