import { useId, type ReactNode } from 'react'
import { ANCHOR_HEIGHT } from '../figure/layout'
import type { CellsFigure, FigActor, FigCell, FigTone, Figure as FigureSpec, GanttFigure, GraphFigure, SeqFigure, XYFigure } from '../types'
import { deviceShapes } from './Device'

/** 図を表示するときの拡大率（viewBox の座標より少し大きく描く） */
const SCALE = 1.25

/** 文字列のおおよその幅（全角を1文字、半角を0.58文字として数える） */
export function textWidth(s: string, size: number): number {
  let n = 0
  for (const ch of s) n += ch.charCodeAt(0) < 0x80 ? 0.58 : 1
  return n * size
}

const TONES: readonly FigTone[] = ['normal', 'attack', 'defense', 'blocked', 'muted']

/** 図の中で使う矢印の先。色ごとに用意する */
function Markers({ uid }: { uid: string }) {
  return (
    <defs>
      {TONES.map((t) => (
        <marker
          key={t}
          id={`${uid}-a-${t}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className={`fig-head t-${t}`} />
        </marker>
      ))}
      <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" className="fig-hatch" />
      </pattern>
    </defs>
  )
}

/** Label を置いたときの左端（番号をラベルに重ねないため） */
function labelLeft(text: string, cx: number, max: number, size = 10): number {
  const w = textWidth(text, size) + 8
  return Math.min(Math.max(cx, w / 2 + 2), max - w / 2 - 2) - w / 2
}

/** 背景付きの文字（線の上に置いても読めるように） */
function Label({ x: cx, y, text, size = 10, add, max }: { x: number; y: number; text: string; size?: number; add?: boolean; max?: number }) {
  const w = textWidth(text, size) + 8
  const x = max ? Math.min(Math.max(cx, w / 2 + 2), max - w / 2 - 2) : cx
  return (
    <g className={add ? 'fig-label add' : 'fig-label'}>
      <rect x={x - w / 2} y={y - size + 0.5} width={w} height={size + 5} rx={3} className="fig-label-bg" />
      <text x={x} y={y + 1.5} textAnchor="middle" fontSize={size}>
        {text}
      </text>
    </g>
  )
}

const BOX_H = 30
const CIRCLE_R = 17
const boxWidth = (a: FigActor) => Math.max(56, textWidth(a.name, 11) + 18)

/** 人・機器・箱。x, y は機器なら床面の手前の角、箱と丸なら下端 */
function Actor({ actor, x, y }: { actor: FigActor; x: number; y: number }) {
  const cls = `fig-actor${actor.alert ? ' alert' : ''}${actor.add ? ' add' : ''}`
  if (actor.icon === 'box' || actor.icon === 'circle') {
    const isBox = actor.icon === 'box'
    const w = boxWidth(actor)
    const cy = y - (isBox ? BOX_H / 2 : CIRCLE_R)
    return (
      <g className={cls}>
        {isBox ? (
          <rect x={x - w / 2} y={y - BOX_H} width={w} height={BOX_H} rx={5} className="fig-shape" />
        ) : (
          <circle cx={x} cy={cy} r={CIRCLE_R} className="fig-shape" />
        )}
        <text x={x} y={cy + 4} textAnchor="middle" className="fig-shape-text">
          {actor.name}
        </text>
        {actor.sub && (
          <text x={x} y={y + 13} textAnchor="middle" className="fig-sub">
            {actor.sub}
          </text>
        )}
      </g>
    )
  }
  const node = { x, y, type: actor.icon, name: actor.name, sub: actor.sub ?? '' }
  return (
    <g className={cls}>
      {actor.add && <ellipse cx={x} cy={y - 2} rx={26} ry={10} className="fig-add-ring" />}
      {deviceShapes(node, !!actor.alert)}
      {actor.icon !== 'cloud' && (
        <>
          <text x={x} y={y + 14} textAnchor="middle" className={actor.alert ? 'fig-name atk' : 'fig-name'}>
            {actor.name}
          </text>
          {actor.sub && (
            <text x={x} y={y + 25} textAnchor="middle" className="fig-sub">
              {actor.sub}
            </text>
          )}
        </>
      )}
    </g>
  )
}

function SeqDiagram({ fig, uid }: { fig: SeqFigure; uid: string }) {
  const n = fig.actors.length
  const width = Math.max(440, n * 118)
  const col = width / n
  const xOf = new Map(fig.actors.map((a, i) => [a.id, col * (i + 0.5)]))
  const top = 104
  const row = 34
  const height = top + fig.messages.length * row + 10
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.actors.map((a) => (
        <line key={`life-${a.id}`} x1={xOf.get(a.id)} y1={84} x2={xOf.get(a.id)} y2={height - 6} className="fig-life" />
      ))}
      {fig.actors.map((a) => (
        <Actor key={a.id} actor={a} x={xOf.get(a.id)!} y={a.icon === 'box' || a.icon === 'circle' ? 70 : 52} />
      ))}
      {fig.messages.map((m, i) => {
        const y = top + i * row
        const x1 = xOf.get(m.from)!
        const x2 = xOf.get(m.to)!
        const tone = m.tone ?? 'normal'
        const num = `${i + 1}`
        if (m.from === m.to) {
          const w = textWidth(m.label, 10) + 16
          const cx = Math.min(Math.max(x1, w / 2 + 16), width - w / 2 - 2)
          return (
            <g key={i} className={`fig-msg t-${tone}${m.add ? ' add' : ''}`}>
              <rect x={cx - w / 2} y={y - 12} width={w} height={20} rx={4} className="fig-proc" />
              <text x={cx} y={y + 2} textAnchor="middle" fontSize={10} className="fig-proc-text">
                {m.label}
              </text>
              <text x={cx - w / 2 - 6} y={y + 2} textAnchor="end" className="fig-num">
                {num}
              </text>
            </g>
          )
        }
        const dir = Math.sign(x2 - x1)
        const start = x1 + dir * 3
        const end = tone === 'blocked' ? x1 + (x2 - x1) * 0.62 : x2 - dir * 3
        return (
          <g key={i} className={`fig-msg t-${tone}${m.add ? ' add' : ''}`}>
            <line x1={start} y1={y + 6} x2={end} y2={y + 6} className="fig-arrow" markerEnd={tone === 'blocked' ? undefined : `url(#${uid}-a-${tone})`} />
            {tone === 'blocked' && <path d={`M${end - 5},${y + 1} l10,10 M${end + 5},${y + 1} l-10,10`} className="fig-cross" />}
            <Label x={(x1 + x2) / 2} y={y - 3} text={m.label} add={m.add} max={width} />
            <text x={Math.min(x1, x2, labelLeft(m.label, (x1 + x2) / 2, width)) - 8} y={y + 9} textAnchor="end" className="fig-num">
              {num}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Cell({ cell, x, y, w, h, uid }: { cell: FigCell; x: number; y: number; w: number; h: number; uid: string }) {
  // 区画の幅に収まるよう、文字の大きさを小さくする（文字の大きさは属性で指定する。CSSでは指定しない）
  const fit = (text: string, base: number) => Math.max(7, Math.min(base, (w - 6) / Math.max(textWidth(text, 1), 0.1)))
  const size = fit(cell.label, w < 34 ? 11 : 12)
  const subSize = cell.sub ? fit(cell.sub, 9) : 9
  return (
    <g className={`fig-cell c-${cell.c ?? 'ink'}${cell.add ? ' add' : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx={3} className="fig-cell-box" />
      {cell.hatch && <rect x={x} y={y} width={w} height={h} rx={3} fill={`url(#${uid}-hatch)`} className="fig-cell-enc" />}
      <text x={x + w / 2} y={cell.sub ? y + h / 2 - 2 : y + h / 2 + 4} textAnchor="middle" className="fig-cell-label" fontSize={size}>
        {cell.label}
      </text>
      {cell.sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" className="fig-cell-sub" fontSize={subSize}>
          {cell.sub}
        </text>
      )}
    </g>
  )
}

function CellsDiagram({ fig, uid }: { fig: CellsFigure; uid: string }) {
  const width = 560
  const pad = 4
  const cellH = 46
  const rowH = cellH + 34
  const height = fig.rows.length * rowH + 4
  // 区画の幅は、いちばん区画の多い行に合わせる（行どうしの位置をそろえて比べやすくする）
  const maxTotal = Math.max(...fig.rows.map((r) => r.cells.reduce((s, c) => s + (c.w ?? 1), 0)))
  const maxCount = Math.max(...fig.rows.map((r) => r.cells.length))
  const unit = Math.min(64, (width - pad * 2 - (maxCount - 1) * 3) / maxTotal)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.rows.map((r, i) => {
        const y = i * rowH + 22
        const total = r.cells.reduce((s, c) => s + (c.w ?? 1), 0)
        // 区画が少ない行は、1区画の幅を広げすぎない（幅いっぱいに伸ばすのは、行に1〜2区画のときだけ）
        const rowUnit = r.cells.length <= 2 && total <= 3 ? (width - pad * 2 - (r.cells.length - 1) * 3) / total : unit
        let x = pad
        return (
          <g key={i}>
            <text x={pad} y={y - 8} className="fig-row-caption">
              {r.caption}
            </text>
            {r.cells.map((c, j) => {
              const w = (c.w ?? 1) * rowUnit
              const el = <Cell key={j} cell={c} x={x} y={y} w={w} h={cellH} uid={uid} />
              x += w + 3
              return el
            })}
          </g>
        )
      })}
    </svg>
  )
}

function GraphDiagram({ fig, uid }: { fig: GraphFigure; uid: string }) {
  const CW = fig.cw ?? 150
  const CH = fig.ch ?? 104
  const width = fig.cols * CW
  const height = fig.rows * CH
  const isShape = (a: FigActor) => a.icon === 'box' || a.icon === 'circle'
  const pos = new Map(fig.nodes.map((n) => [n.id, { x: n.x * CW + CW / 2, y: n.y * CH + CH / 2 + (isShape(n) ? 16 : 14), n }]))
  /** 線をつなぐ中心と、そこからの縮める量（方向によって変える） */
  const anchor = (id: string) => {
    const p = pos.get(id)!
    const n = p.n
    if (n.icon === 'box') return { x: p.x, y: p.y - BOX_H / 2, hw: boxWidth(n) / 2 + 2, hh: BOX_H / 2 + 2 }
    if (n.icon === 'circle') return { x: p.x, y: p.y - CIRCLE_R, hw: CIRCLE_R + 2, hh: CIRCLE_R + 2, round: true }
    if (n.icon === 'cloud') return { x: p.x, y: p.y, hw: 44, hh: 44, round: true }
    return { x: p.x, y: p.y - Math.max(ANCHOR_HEIGHT[n.icon], 10), hw: 24, hh: 24, round: true }
  }
  const shrink = (a: ReturnType<typeof anchor>, ux: number, uy: number, len: number) => {
    const s = a.round ? a.hw : Math.min(Math.abs(ux) > 1e-6 ? a.hw / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? a.hh / Math.abs(uy) : Infinity)
    return Math.min(s, len / 2.5)
  }
  const lines = fig.links.map((l) => {
    const a = anchor(l.from)
    const b = anchor(l.to)
    const tone = l.tone ?? (l.arrow ? 'normal' : 'muted')
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const sa = shrink(a, ux, uy, len)
    const sb = shrink(b, ux, uy, len)
    const x1 = a.x + ux * sa
    const y1 = a.y + uy * sa
    const x2 = b.x - ux * sb
    const y2 = b.y - uy * sb
    const blocked = tone === 'blocked'
    const ex = blocked ? x1 + (x2 - x1) * 0.7 : x2
    const ey = blocked ? y1 + (y2 - y1) * 0.7 : y2
    let nx = uy
    let ny = -ux
    if (ny > 0) {
      nx = -nx
      ny = -ny
    }
    const lx = (x1 + ex) / 2 + nx * 9
    const ly = (y1 + ey) / 2 + ny * 9 + 3
    return { l, tone, blocked, x1, y1, ex, ey, lx, ly }
  })
  const cls = (l: (typeof lines)[number]) => `fig-link t-${l.tone}${l.l.dashed ? ' dashed' : ''}${l.l.add ? ' add' : ''}`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {fig.zones?.map((z, i) => (
        <g key={i} className={z.add ? 'fig-zone add' : 'fig-zone'}>
          <rect x={z.x * CW + 5} y={z.y * CH + 5} width={z.w * CW - 10} height={z.h * CH - 10} rx={8} />
          <text x={z.x * CW + 14} y={z.y * CH + 20}>
            {z.label}
          </text>
        </g>
      ))}
      {lines.map((v, i) => (
        <g key={i} className={cls(v)}>
          <line x1={v.x1} y1={v.y1} x2={v.ex} y2={v.ey} markerEnd={v.l.arrow && !v.blocked ? `url(#${uid}-a-${v.tone})` : undefined} />
        </g>
      ))}
      {fig.nodes.map((n) => {
        const p = pos.get(n.id)!
        return <Actor key={n.id} actor={n} x={p.x} y={p.y} />
      })}
      {lines.map((v, i) => (
        <g key={i} className={cls(v)}>
          {v.blocked && <path d={`M${v.ex - 5},${v.ey - 5} l10,10 M${v.ex + 5},${v.ey - 5} l-10,10`} className="fig-cross" />}
          {v.l.label && <Label x={v.lx} y={v.ly} text={v.l.label} size={9.5} add={v.l.add} max={width} />}
        </g>
      ))}
    </svg>
  )
}

/** 目盛りの間隔（1, 2, 5, 10, 20, 50 … のうち、5〜10本になるもの） */
function tickStep(max: number): number {
  const raw = max / 6
  const pow = 10 ** Math.floor(Math.log10(raw))
  for (const m of [1, 2, 5, 10]) if (raw <= m * pow) return m * pow
  return 10 * pow
}

function XYDiagram({ fig, uid }: { fig: XYFigure; uid: string }) {
  const width = 540
  const height = 300
  const left = 58
  const right = 16
  const top = 30
  const bottom = 42
  const pw = width - left - right
  const ph = height - top - bottom
  const sx = (x: number) => left + (x / fig.xMax) * pw
  const sy = (y: number) => top + ph - (y / fig.yMax) * ph
  const xs = tickStep(fig.xMax)
  const ys = tickStep(fig.yMax)
  const xt: number[] = []
  for (let v = 0; v <= fig.xMax + 1e-9; v += xs) xt.push(v)
  const yt: number[] = []
  for (let v = 0; v <= fig.yMax + 1e-9; v += ys) yt.push(v)
  const fmt = (v: number) => (Number.isInteger(v) ? v.toLocaleString('ja-JP') : v.toFixed(1))
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {yt.map((v) => (
        <g key={`y${v}`}>
          <line x1={left} y1={sy(v)} x2={left + pw} y2={sy(v)} className="fig-grid" />
          <text x={left - 6} y={sy(v) + 4} textAnchor="end" className="fig-tick">
            {fmt(v)}
          </text>
        </g>
      ))}
      {xt.map((v) => (
        <text key={`x${v}`} x={sx(v)} y={top + ph + 16} textAnchor="middle" className="fig-tick">
          {fmt(v)}
        </text>
      ))}
      <line x1={left} y1={top + ph} x2={left + pw} y2={top + ph} className="fig-axis" />
      <line x1={left} y1={top} x2={left} y2={top + ph} className="fig-axis" />
      <text x={left + pw / 2} y={height - 6} textAnchor="middle" className="fig-axis-label">
        {fig.xLabel}
      </text>
      <text x={8} y={16} className="fig-axis-label">
        {fig.yLabel}
      </text>
      {fig.series.map((s, i) => {
        const pts = s.points.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')
        const [lx, ly] = s.points[s.points.length - 1]!
        return (
          <g key={i} className={`fig-series t-${s.tone ?? 'normal'}${s.add ? ' add' : ''}`}>
            <polyline points={pts} className="fig-series-line" />
            <Label x={Math.min(sx(lx), width - 40)} y={sy(ly) - 8} text={s.label} add={s.add} max={width} />
          </g>
        )
      })}
      {fig.marks?.map((mk, i) => (
        <g key={i} className={mk.add ? 'fig-mark add' : 'fig-mark'}>
          <line x1={sx(mk.x)} y1={sy(mk.y)} x2={sx(mk.x)} y2={top + ph} className="fig-mark-guide" />
          <circle cx={sx(mk.x)} cy={sy(mk.y)} r={4.5} className="fig-mark-dot" />
          <Label x={sx(mk.x)} y={sy(mk.y) + 22} text={mk.label} add={mk.add} max={width} />
        </g>
      ))}
    </svg>
  )
}

function GanttDiagram({ fig, uid }: { fig: GanttFigure; uid: string }) {
  const labelW = Math.max(60, ...fig.rows.map((r) => textWidth(r.label, 11) + 14))
  const width = 560
  const top = 26
  const rowH = 34
  const pw = width - labelW - 8
  const unit = pw / fig.end
  const height = top + fig.rows.length * rowH + 8
  const every = fig.end <= 20 ? 1 : fig.end <= 40 ? 2 : 5
  const ticks: number[] = []
  for (let t = 0; t <= fig.end; t += every) ticks.push(t)
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width * SCALE} className="fig-svg">
      <Markers uid={uid} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={labelW + t * unit} y1={top - 4} x2={labelW + t * unit} y2={height - 6} className="fig-grid" />
          <text x={labelW + t * unit} y={top - 9} textAnchor="middle" className="fig-tick">
            {t}
          </text>
        </g>
      ))}
      {fig.unit && (
        <text x={labelW - 8} y={top - 9} textAnchor="end" className="fig-axis-label">
          {fig.unit}
        </text>
      )}
      {fig.rows.map((r, i) => {
        const y = top + i * rowH + 4
        return (
          <g key={i}>
            <text x={labelW - 8} y={y + 17} textAnchor="end" className="fig-row-caption">
              {r.label}
            </text>
            {r.bars.map((b, j) => {
              const x = labelW + b.start * unit
              const w = b.len * unit
              return (
                <g key={j} className={`fig-cell c-${b.c ?? 'blue'}${b.add ? ' add' : ''}`}>
                  <rect x={x + 1} y={y} width={Math.max(w - 2, 2)} height={rowH - 10} rx={3} className="fig-cell-box" />
                  {b.label && textWidth(b.label, 10) < w - 4 && (
                    <text x={x + w / 2} y={y + 16} textAnchor="middle" className="fig-cell-label" fontSize={10}>
                      {b.label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/** 図の中に、強調（この節で加わったもの・注目するもの）があるか */
export function hasAdd(fig: FigureSpec): boolean {
  switch (fig.kind) {
    case 'seq':
      return fig.actors.some((a) => a.add) || fig.messages.some((m) => m.add)
    case 'cells':
      return fig.rows.some((r) => r.cells.some((c) => c.add))
    case 'graph':
      return fig.nodes.some((n) => n.add) || fig.links.some((l) => l.add) || !!fig.zones?.some((z) => z.add)
    case 'xy':
      return fig.series.some((s) => s.add) || !!fig.marks?.some((m) => m.add)
    case 'gantt':
      return fig.rows.some((r) => r.bars.some((b) => b.add))
  }
}

/** 図。caption は図の下に出し、読み上げ用の名前にも使う */
export function Figure({
  figure,
  caption,
  number,
  legend = 'この節で加わったもの',
}: {
  figure: FigureSpec
  caption: ReactNode
  number?: string
  legend?: string
}) {
  const uid = `f${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <figure className="book-fig">
      <div className="fig-scroll" role="img" aria-labelledby={`${uid}-cap`}>
        {figure.kind === 'seq' && <SeqDiagram fig={figure} uid={uid} />}
        {figure.kind === 'cells' && <CellsDiagram fig={figure} uid={uid} />}
        {figure.kind === 'graph' && <GraphDiagram fig={figure} uid={uid} />}
        {figure.kind === 'xy' && <XYDiagram fig={figure} uid={uid} />}
        {figure.kind === 'gantt' && <GanttDiagram fig={figure} uid={uid} />}
      </div>
      <figcaption id={`${uid}-cap`}>
        {number && <span className="fig-no">図{number}</span>}
        <span>{caption}</span>
        {hasAdd(figure) && (
          <span className="fig-legend">
            <span className="fig-legend-mark" aria-hidden="true" />
            {legend}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
