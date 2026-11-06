import type { Scene } from './types'
import { shown } from './parts'

const CASES: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 1],
]

function Switch({ x, y, on, name }: { x: number; y: number; on: boolean; name: string }) {
  return (
    <g>
      <rect x={x} y={y} width={64} height={34} rx={17} className={`sc-color ${on ? 'sc-lamp-on' : 'sc-lamp-off'}`} />
      <circle cx={on ? x + 47 : x + 17} cy={y + 17} r={12} className="sc-knob sc-move" />
      <text x={x - 12} y={y + 23} textAnchor="end" className="sc-big">
        {name}
      </text>
      <text x={x + 32} y={y + 58} textAnchor="middle" className="sc-big">
        {on ? 1 : 0}
      </text>
    </g>
  )
}

function Lamp({ x, y, on, name, sub }: { x: number; y: number; on: boolean; name: string; sub: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={24} className={`sc-color ${on ? 'sc-on sc-glow' : 'sc-off'}`} />
      <text x={x + 36} y={y - 2} className="sc-big">
        {name} = {on ? 1 : 0}
      </text>
      <text x={x + 36} y={y + 18} className="sc-small">
        {sub}
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const [a, b] = CASES[beat]!
  const s = a !== b
  const c = a === 1 && b === 1
  const table = beat === 4
  const wire = (on: boolean) => `sc-color ${on ? 'sc-wire-on' : 'sc-wire'}`
  return (
    <g>
      <g className="sc-fade" style={shown(!table)}>
        <Switch x={80} y={80} on={a === 1} name="A" />
        <Switch x={80} y={210} on={b === 1} name="B" />
        {/* 配線 */}
        <path d="M 144 97 H 200 V 110 H 270" className={wire(a === 1)} />
        <path d="M 200 97 V 230 H 270" className={wire(a === 1)} />
        <path d="M 144 227 H 230 V 250 H 270" className={wire(b === 1)} />
        <path d="M 230 227 V 130 H 270" className={wire(b === 1)} />
        {/* XOR と AND の箱 */}
        <rect x={270} y={90} width={110} height={60} rx={10} className="sc-panel" />
        <text x={325} y={116} textAnchor="middle" className="sc-title">
          XOR
        </text>
        <text x={325} y={136} textAnchor="middle" className="sc-small">
          違えば 1
        </text>
        <rect x={270} y={210} width={110} height={60} rx={10} className="sc-panel" />
        <text x={325} y={236} textAnchor="middle" className="sc-title">
          AND
        </text>
        <text x={325} y={256} textAnchor="middle" className="sc-small">
          両方 1 なら 1
        </text>
        <path d="M 380 120 H 430" className={wire(s)} />
        <path d="M 380 240 H 430" className={wire(c)} />
        <Lamp x={455} y={120} on={s} name="S" sub="和（この桁）" />
        <Lamp x={455} y={240} on={c} name="C" sub="桁上がり" />
        <g className="sc-fade" style={shown(beat >= 1)}>
          <text x={320} y={330} textAnchor="middle" className="sc-big">
            {a} + {b} = {c ? '10（2進数）' : s ? '1' : '0'}
          </text>
        </g>
      </g>

      <g className="sc-fade" style={shown(table)}>
        <text x={320} y={50} textAnchor="middle" className="sc-title">
          4通りの入力をまとめると（真理値表）
        </text>
        {['A', 'B', 'C（AND）', 'S（XOR）'].map((h, i) => (
          <text key={h} x={170 + i * 100} y={92} textAnchor="middle" className="sc-title">
            {h}
          </text>
        ))}
        {[
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ].map(([x, y], r) => (
          <g key={r}>
            <rect x={110} y={104 + r * 48} width={420} height={42} rx={8} className={x === 1 && y === 1 ? 'sc-hot' : 'sc-panel'} />
            {[x!, y!, x! & y!, x! ^ y!].map((v, i) => (
              <text key={i} x={170 + i * 100} y={132 + r * 48} textAnchor="middle" className="sc-big">
                {v}
              </text>
            ))}
          </g>
        ))}
        <text x={320} y={318} textAnchor="middle" className="sc-small">
          下の桁からの桁上がりも足すには、半加算器2つと OR で「全加算器」を作る
        </text>
      </g>
    </g>
  )
}

export const adderScene: Scene = {
  label: '2つのスイッチ A と B を入れ、XOR のランプ（和）と AND のランプ（桁上がり）で1ビットの足し算をする',
  Stage,
  beats: [
    { say: '半加算器は、1ビットどうしを足す回路です。スイッチ A と B の信号が、XOR と AND の2つの回路に同時に入ります。' },
    { say: 'A も B も 0 なら、どちらのランプも消えたまま。0 + 0 = 0 です。' },
    { say: 'B だけ 1 にすると、入力が「違う」ので XOR のランプ S が点きます。AND は両方 1 ではないので消えたまま。0 + 1 = 1 です。' },
    { say: '両方 1 にすると、XOR は「同じ」なので消え、AND のランプ C（桁上がり）が点きます。2進数で 1 + 1 = 10 です。' },
    { say: '4通りをまとめると、和 S は XOR、桁上がり C は AND とまったく同じ表になります。' },
  ],
}
