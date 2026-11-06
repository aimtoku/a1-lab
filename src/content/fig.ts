import type {
  Block,
  CellColor,
  CellsFigure,
  FigActor,
  FigCell,
  FigLink,
  FigMessage,
  FigNode,
  FigTone,
  FigZone,
  Figure,
  GanttFigure,
  GraphFigure,
  SeqFigure,
  XYFigure,
} from '../types'

// 章や図解を書きやすくするための小さな関数

export const p = (text: string): Block => ({ kind: 'p', text })
export const note = (text: string): Block => ({ kind: 'note', text })
export const list = (...items: string[]): Block => ({ kind: 'list', items })
export const steps = (...items: [string, string][]): Block => ({ kind: 'steps', items: items.map(([title, text]) => ({ title, text })) })
export const table = (head: string[], ...rows: string[][]): Block => ({ kind: 'table', head, rows })
export const formula = (...lines: string[]): Block => ({ kind: 'formula', lines })
export const fig = (figure: Figure, caption: string): Block => ({ kind: 'figure', figure, caption })

type Opts = Omit<FigActor, 'id' | 'name' | 'icon'>

/** 人・機器・箱 */
export const actor = (id: string, name: string, icon: FigActor['icon'], opts: Opts = {}): FigActor => ({ id, name, icon, ...opts })

/** やり取り。tone を省略すると通常の色 */
export const m = (from: string, to: string, label: string, tone: FigTone = 'normal', add = false): FigMessage => ({ from, to, label, tone, add })
/** この節で加わったやり取り */
export const mAdd = (from: string, to: string, label: string, tone: FigTone = 'normal'): FigMessage => m(from, to, label, tone, true)

export const seq = (actors: FigActor[], messages: FigMessage[]): SeqFigure => ({ kind: 'seq', actors, messages })

/** 区画 */
export const cell = (label: string, sub?: string, opts: { c?: CellColor; w?: number; hatch?: boolean; add?: boolean } = {}): FigCell => ({
  label,
  ...(sub ? { sub } : {}),
  ...opts,
})
/** 注目する区画 */
export const hot = (label: string, sub?: string, opts: { c?: CellColor; w?: number } = {}): FigCell => cell(label, sub, { ...opts, add: true })
export const cells = (...rows: [string, FigCell[]][]): CellsFigure => ({ kind: 'cells', rows: rows.map(([caption, cs]) => ({ caption, cells: cs })) })

/** ビットの並び（"0110" のような文字列から作る）。hi に入れた位置（0から）を強調する */
export const bits = (s: string, hi: number[] = [], c: CellColor = 'blue'): FigCell[] =>
  [...s].map((b, i) => (hi.includes(i) ? hot(b, undefined, { c }) : cell(b, undefined, { c: 'blue' })))

/** 配列の並び。hi に入れた位置（0から）を強調する */
export const arr = (values: (string | number)[], hi: number[] = [], c: CellColor = 'teal', subs?: string[]): FigCell[] =>
  values.map((v, i) => (hi.includes(i) ? hot(String(v), subs?.[i], { c }) : cell(String(v), subs?.[i], { c })))

/** 構成図・グラフの節点 */
export const node = (id: string, name: string, icon: FigActor['icon'], x: number, y: number, opts: Opts = {}): FigNode => ({ id, name, icon, x, y, ...opts })
export const box = (id: string, name: string, x: number, y: number, opts: Opts = {}): FigNode => node(id, name, 'box', x, y, opts)
export const circle = (id: string, name: string, x: number, y: number, opts: Opts = {}): FigNode => node(id, name, 'circle', x, y, opts)
export const link = (from: string, to: string, opts: Omit<FigLink, 'from' | 'to'> = {}): FigLink => ({ from, to, ...opts })
export const arrow = (from: string, to: string, label?: string, opts: Omit<FigLink, 'from' | 'to' | 'label' | 'arrow'> = {}): FigLink => ({
  from,
  to,
  arrow: true,
  ...(label ? { label } : {}),
  ...opts,
})
export const zone = (label: string, x: number, y: number, w: number, h: number, add = false): FigZone => ({ label, x, y, w, h, add })
export const graph = (
  cols: number,
  rows: number,
  nodes: FigNode[],
  links: FigLink[],
  zones: FigZone[] = [],
  size?: { cw?: number; ch?: number },
): GraphFigure => ({
  kind: 'graph',
  cols,
  rows,
  nodes,
  links,
  zones,
  ...size,
})

export const xy = (spec: Omit<XYFigure, 'kind'>): XYFigure => ({ kind: 'xy', ...spec })

/** 時間の流れ。bar は [開始, 長さ, ラベル, 色, 強調] */
export const gantt = (end: number, rows: [string, [number, number, string?, CellColor?, boolean?][]][], unit?: string): GanttFigure => ({
  kind: 'gantt',
  end,
  ...(unit ? { unit } : {}),
  rows: rows.map(([label, bars]) => ({
    label,
    bars: bars.map(([start, len, l, c, add]) => ({ start, len, ...(l ? { label: l } : {}), ...(c ? { c } : {}), ...(add ? { add } : {}) })),
  })),
})
