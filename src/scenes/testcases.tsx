import type { Scene } from './types'
import { shown } from './parts'

/** 数直線：−20〜140 を 40〜600 に */
const X = (v: number) => 40 + ((v + 20) / 160) * 560
const LINE_Y = 120

const GROUPS = [
  { from: -20, to: 0, label: '無効', sub: '0未満', tone: 'sc-zone-ng', pick: -5 },
  { from: 0, to: 20, label: '未成年', sub: '0〜19', tone: 'sc-zone-a', pick: 10 },
  { from: 20, to: 121, label: '成人', sub: '20〜120', tone: 'sc-zone-b', pick: 50 },
  { from: 121, to: 140, label: '無効', sub: '121以上', tone: 'sc-zone-ng', pick: 130 },
]
const EDGES = [
  [-1, 0],
  [19, 20],
  [120, 121],
] as const

function Pin({ v, tone, y = LINE_Y, label }: { v: number; tone: string; y?: number; label?: string }) {
  return (
    <g>
      <circle cx={X(v)} cy={y} r={9} className={tone} />
      <text x={X(v)} y={y - 16} textAnchor="middle" className="sc-title">
        {label ?? v}
      </text>
    </g>
  )
}

/** 判定の中の2つの条件（ランプ） */
function Lamp({ x, y, on, text }: { x: number; y: number; on: boolean; text: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} className={`sc-color ${on ? 'sc-lamp-on' : 'sc-lamp-off'}`} />
      <text x={x + 18} y={y + 5} className="sc-text">
        {text}：{on ? '真' : '偽'}
      </text>
    </g>
  )
}

const WB: readonly { v: number; c1: boolean; c2: boolean }[][] = [
  [],
  [],
  [],
  [],
  [
    { v: 50, c1: true, c2: true },
    { v: 150, c1: true, c2: false },
  ],
  [
    { v: -1, c1: false, c2: true },
    { v: 150, c1: true, c2: false },
  ],
]

function Stage({ beat }: { beat: number }) {
  const box = beat >= 4
  return (
    <g>
      <g className="sc-fade" style={shown(!box)}>
        {GROUPS.map((g, i) => (
          <g key={i} className="sc-fade" style={shown(beat >= 1)}>
            <rect x={X(g.from)} y={LINE_Y - 4} width={X(g.to) - X(g.from)} height={8} className={g.tone} />
            <text x={(X(g.from) + X(g.to)) / 2} y={LINE_Y + 44} textAnchor="middle" className="sc-title">
              {g.label}
            </text>
            <text x={(X(g.from) + X(g.to)) / 2} y={LINE_Y + 62} textAnchor="middle" className="sc-small">
              {g.sub}
            </text>
          </g>
        ))}
        <line x1={40} y1={LINE_Y} x2={600} y2={LINE_Y} className="sc-line" />
        {[0, 20, 120].map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={LINE_Y - 10} x2={X(v)} y2={LINE_Y + 10} className="sc-line" />
            <text x={X(v)} y={LINE_Y + 26} textAnchor="middle" className="sc-small">
              {v}
            </text>
          </g>
        ))}
        <g className="sc-fade" style={shown(beat === 1)}>
          {GROUPS.map((g, i) => (
            <Pin key={i} v={g.pick} tone="sc-pin" />
          ))}
          <text x={320} y={250} textAnchor="middle" className="sc-big">
            グループごとに代表を1つ：−5, 10, 50, 130
          </text>
        </g>
        <g className="sc-fade" style={shown(beat >= 2)}>
          {EDGES.map(([a, b]) => (
            <Pin key={a} v={(a + b) / 2} tone={beat === 3 && b === 20 ? 'sc-pin-bug' : 'sc-pin-edge'} label={`${a < 0 ? '−1' : a}・${b}`} />
          ))}
        </g>
        <g className="sc-fade" style={shown(beat === 2)}>
          <text x={320} y={250} textAnchor="middle" className="sc-big">
            境目と、その両隣を選ぶ：−1, 0, 19, 20, 120, 121
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 3)}>
          <text x={320} y={238} textAnchor="middle" className="sc-text">
            プログラムに「20より大きい」と書き間違えると…
          </text>
          <text x={320} y={272} textAnchor="middle" className="sc-big sc-ng-text">
            20 を入れたら「未成年」→ 誤りが見つかる
          </text>
          <text x={320} y={300} textAnchor="middle" className="sc-small">
            代表の 50 では「成人」と正しく出て、気づけない
          </text>
        </g>
      </g>

      {/* 中を見る：判定の箱 */}
      <g className="sc-fade" style={shown(box)}>
        <rect x={100} y={40} width={440} height={70} rx={12} className="sc-panel" />
        <text x={320} y={70} textAnchor="middle" className="sc-title">
          プログラムの中の判定
        </text>
        <text x={320} y={94} textAnchor="middle" className="sc-text">
          （条件1）年齢 ≧ 0　かつ　（条件2）年齢 ≦ 120
        </text>
        {(WB[beat] ?? []).map((c, i) => {
          const all = c.c1 && c.c2
          return (
            <g key={`${beat}-${i}`} className="sc-pop">
              <rect x={40 + i * 300} y={140} width={260} height={150} rx={12} className="sc-panel" />
              <text x={60 + i * 300} y={172} className="sc-big">
                {c.v} を入れる
              </text>
              <Lamp x={72 + i * 300} y={200} on={c.c1} text="条件1" />
              <Lamp x={72 + i * 300} y={230} on={c.c2} text="条件2" />
              <text x={60 + i * 300} y={272} className={`sc-title ${all ? 'sc-ok-text' : 'sc-ng-text'}`}>
                判定全体：{all ? '真' : '偽'}
              </text>
            </g>
          )
        })}
        <g className="sc-fade" style={shown(beat === 4)}>
          <text x={320} y={330} textAnchor="middle" className="sc-title">
            判定全体が「真」と「偽」の両方になる → 判定網羅
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 5)}>
          <text x={320} y={322} textAnchor="middle" className="sc-title">
            条件1・条件2 がそれぞれ真と偽になる → 条件網羅
          </text>
          <text x={320} y={346} textAnchor="middle" className="sc-small">
            でも判定全体はどちらも「偽」。条件網羅でも判定網羅になるとは限らない
          </text>
        </g>
      </g>
    </g>
  )
}

export const testcasesScene: Scene = {
  label: '年齢の数直線をグループと境目に分け、テストに使う値を選ぶ。次に、判定の中の条件を見る',
  Stage,
  beats: [
    { say: '「年齢（0〜120）を入れて、20歳以上なら成人と表示する」プログラムを試します。全部の年齢を試すのは大変なので、試す値を賢く選びます。' },
    { say: '同値分割：同じ扱いになる範囲（グループ）に分け、それぞれから代表を1つずつ選びます。無効・未成年・成人・無効の4つです。' },
    { say: '境界値：誤りは境目で起きやすいので、境目とその両隣の値を選びます。' },
    { say: '「20以上」を「20より大きい」と書き間違えた誤りは、代表の 50 では見つかりません。境目の 20 を入れて初めて見つかります。' },
    { say: 'ここからはプログラムの中を見ます（ホワイトボックス）。判定全体が「真」になる 50 と、「偽」になる 150 があれば、判定網羅を満たします。' },
    { say: '条件網羅は、条件1と条件2がそれぞれ真にも偽にもなるように選びます。−1 と 150 で満たせますが、判定全体は両方とも偽のままです。' },
  ],
}
