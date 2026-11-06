/**
 * サイトのデータの型。
 * - 章（Chapter）：教科書の1章。節（Section）を積み重ね、節ごとに図を置く。章の最後に確認問題（4択）。
 * - 図解（Walk）：計算や処理の流れを、1ステップずつ図で再生する。
 */

/** 図に描く機器の種類（ネットワークの図で使う） */
export type DeviceType = 'server' | 'pc' | 'laptop' | 'switch' | 'fw' | 'ap' | 'cloud' | 'team'

/** 図の矢印や線の色分け */
export type FigTone = 'normal' | 'attack' | 'defense' | 'blocked' | 'muted'

/** 図の部品の色（区画やバーの色） */
export type CellColor = 'gray' | 'blue' | 'teal' | 'amber' | 'purple' | 'ink'

/** 図に描く人・機器・箱。box は四角、circle は丸（木構造や状態遷移の節点）に名前を入れて描く */
export interface FigActor {
  id: string
  name: string
  sub?: string
  icon: DeviceType | 'box' | 'circle'
  /** 注意を引く（赤で描く） */
  alert?: boolean
  /** この節（ステップ）で加わったもの・注目するもの（強調して描く） */
  add?: boolean
}

/** シーケンス図のやり取り。from と to が同じなら、その中での処理 */
export interface FigMessage {
  from: string
  to: string
  label: string
  tone?: FigTone
  add?: boolean
}

/** シーケンス図：だれとだれが、どの順にやり取りするか */
export interface SeqFigure {
  kind: 'seq'
  actors: readonly FigActor[]
  messages: readonly FigMessage[]
}

/** 区画（ビット、配列の要素、メモリ、レジスタなど） */
export interface FigCell {
  label: string
  sub?: string
  c?: CellColor
  /** 横幅の比（既定 1） */
  w?: number
  /** 斜線（暗号化、使用中など） */
  hatch?: boolean
  add?: boolean
}

/** 区画の並び：行ごとに区画を横に並べる。前後の比較や、配列の変化を行で表す */
export interface CellsFigure {
  kind: 'cells'
  rows: readonly { caption: string; cells: readonly FigCell[] }[]
}

/** 構成図・グラフの節点。x, y は格子の位置（0から。小数も可） */
export interface FigNode extends FigActor {
  x: number
  y: number
}

export interface FigLink {
  from: string
  to: string
  label?: string
  tone?: FigTone
  arrow?: boolean
  dashed?: boolean
  add?: boolean
}

export interface FigZone {
  label: string
  x: number
  y: number
  w: number
  h: number
  add?: boolean
}

/** 構成図・グラフ：節点と、そのつながり */
export interface GraphFigure {
  kind: 'graph'
  cols: number
  rows: number
  /** 格子の1マスの大きさ（既定 150 × 104）。木構造など、節点が多い図で小さくする */
  cw?: number
  ch?: number
  zones?: readonly FigZone[]
  nodes: readonly FigNode[]
  links: readonly FigLink[]
}

/** 折れ線のグラフ（損益分岐点など） */
export interface XYFigure {
  kind: 'xy'
  xLabel: string
  yLabel: string
  xMax: number
  yMax: number
  series: readonly { label: string; points: readonly (readonly [number, number])[]; tone?: FigTone; add?: boolean }[]
  /** 注目する点 */
  marks?: readonly { x: number; y: number; label: string; add?: boolean }[]
}

/** 時間の流れ（ガントチャート、パイプライン、CPUのスケジューリング） */
export interface GanttFigure {
  kind: 'gantt'
  /** 横軸の目盛りの数（0 から end まで） */
  end: number
  unit?: string
  rows: readonly { label: string; bars: readonly { start: number; len: number; label?: string; c?: CellColor; add?: boolean }[] }[]
}

export type Figure = SeqFigure | CellsFigure | GraphFigure | XYFigure | GanttFigure

/** 本文のかたまり */
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: readonly string[] }
  | { kind: 'steps'; items: readonly { title: string; text: string }[] }
  /** 表。最初の列は行の見出しとして扱う */
  | { kind: 'table'; head: readonly string[]; rows: readonly (readonly string[])[] }
  | { kind: 'note'; text: string }
  /** 計算の式（等幅で表示する） */
  | { kind: 'formula'; lines: readonly string[] }
  | { kind: 'figure'; figure: Figure; caption: string }

export interface Section {
  /** ページ内リンクに使う（英小文字とハイフン） */
  id: string
  title: string
  blocks: readonly Block[]
  /** この節の内容を、ステップで確かめられる図解（図解のIDと、開くステップ。1から） */
  walk?: { id: string; step?: number }
}

/** 午前の形式（4択）の問題 */
export interface ChoiceQuestion {
  question: string
  choices: readonly [string, string, string, string]
  /** 正解の番号（0〜3） */
  answer: 0 | 1 | 2 | 3
  explanation: string
}

/** 分野（テクノロジ・マネジメント・ストラテジ） */
export type AreaId = 'tech' | 'mgmt' | 'strategy'

export interface Chapter {
  id: string
  area: AreaId
  title: string
  /** 章の冒頭に出す一文 */
  lead: string
  /** 試験でよく問われる点 */
  points: readonly string[]
  sections: readonly Section[]
  quiz: readonly ChoiceQuestion[]
}

/** 図解の1ステップ */
export interface WalkStep {
  title: string
  text: string
  figure: Figure
  /** 補足の本文（表や式） */
  blocks?: readonly Block[]
  /** 押さえる点 */
  point?: string
}

/** 図解：計算や処理の流れを、1ステップずつ再生する */
export interface Walk {
  id: string
  /** 関係する章 */
  chapter: string
  title: string
  lead: string
  steps: readonly WalkStep[]
}
