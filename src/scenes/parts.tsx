import type { CSSProperties, ReactNode } from 'react'

/** 位置（と大きさ）。sc-move と組み合わせると、場面が変わったときになめらかに動く */
export function at(x: number, y: number, scale = 1): CSSProperties {
  return { transform: `translate(${x}px, ${y}px)${scale !== 1 ? ` scale(${scale})` : ''}` }
}

/** 見せる・隠す（sc-fade / sc-move と組み合わせる） */
export function shown(on: boolean, dim = false): CSSProperties {
  return { opacity: on ? (dim ? 0.22 : 1) : 0 }
}

/** 横に伸びる棒（sc-grow と組み合わせる）。rate は 0〜1 */
export function grow(rate: number): CSSProperties {
  return { transform: `scaleX(${rate})` }
}

/** 縦に伸びる量（sc-growy と組み合わせる）。rate は 0〜1 */
export function growY(rate: number): CSSProperties {
  return { transform: `scaleY(${rate})` }
}

/** 文字の吹き出し（角丸の四角に文字） */
export function Tag({
  x,
  y,
  w,
  text,
  tone = 'panel',
  size = 14,
}: {
  x: number
  y: number
  w: number
  text: string
  tone?: 'panel' | 'hot' | 'ok' | 'ng'
  size?: number
}) {
  const cls = tone === 'hot' ? 'sc-hot' : tone === 'ok' ? 'sc-tag-ok' : tone === 'ng' ? 'sc-tag-ng' : 'sc-panel'
  return (
    <g>
      <rect x={x} y={y} width={w} height={size + 14} rx={8} className={cls} />
      <text x={x + w / 2} y={y + size + 3} textAnchor="middle" className="sc-text" fontSize={size}>
        {text}
      </text>
    </g>
  )
}

/** 人（机で作業する人など）。x, y は頭の中心 */
export function Person({ x, y, label, children }: { x: number; y: number; label?: string; children?: ReactNode }) {
  return (
    <g>
      <circle cx={x} cy={y} r={16} className="sc-person" />
      <path d={`M ${x - 22} ${y + 52} Q ${x - 22} ${y + 20} ${x} ${y + 20} Q ${x + 22} ${y + 20} ${x + 22} ${y + 52} Z`} className="sc-person" />
      {label && (
        <text x={x} y={y + 72} textAnchor="middle" className="sc-small">
          {label}
        </text>
      )}
      {children}
    </g>
  )
}
