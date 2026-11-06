import type { Scene } from './types'
import { shown } from './parts'

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1]
const X0 = 88
const DX = 66

/** 場面ごとの電球（1 が点灯） */
const BITS: readonly string[] = ['00000000', '00010110', '11101001', '11101010', '11101010', '11101010']

function Bulb({ i, on, carry }: { i: number; on: boolean; carry: boolean }) {
  const x = X0 + i * DX
  return (
    <g>
      <circle cx={x} cy={128} r={24} className={`sc-color ${on ? 'sc-on sc-glow' : 'sc-off'}`} />
      <rect x={x - 9} y={152} width={18} height={12} rx={3} className="sc-off" />
      <text x={x} y={196} textAnchor="middle" className="sc-big">
        {on ? 1 : 0}
      </text>
      <circle cx={x} cy={128} r={31} className="sc-carry sc-fade" style={shown(carry)} />
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const bits = BITS[beat]!
  const signed = beat >= 5
  return (
    <g>
      {WEIGHTS.map((w, i) => (
        <text key={w} x={X0 + i * DX} y={78} textAnchor="middle" className={signed && i === 0 ? 'sc-title sc-ng-text' : 'sc-title'}>
          {signed && i === 0 ? '−128' : w}
        </text>
      ))}
      <text x={X0 - 52} y={78} textAnchor="end" className="sc-small">
        重み
      </text>
      {WEIGHTS.map((_, i) => (
        <Bulb key={i} i={i} on={bits[i] === '1'} carry={beat === 3 && i >= 6} />
      ))}

      {/* 場面ごとの説明 */}
      <g className="sc-fade" style={shown(beat === 1)}>
        <text x={320} y={252} textAnchor="middle" className="sc-big">
          16 + 4 + 2 = 22
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <text x={320} y={252} textAnchor="middle" className="sc-big">
          ぜんぶ反対に（0 ⇄ 1）
        </text>
        <text x={320} y={280} textAnchor="middle" className="sc-small">
          00010110 → 11101001
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={320} y={252} textAnchor="middle" className="sc-big">
          さいごに 1 を足す
        </text>
        <text x={320} y={280} textAnchor="middle" className="sc-small">
          11101001 + 1 = 11101010（右はしの 1+1 が繰り上がる）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={210} y={244} className="sc-mono">
          {'  00010110   (22)'}
        </text>
        <text x={210} y={270} className="sc-mono">
          {'+ 11101010  (−22)'}
        </text>
        <line x1={210} y1={280} x2={420} y2={280} className="sc-line" />
        <text x={210} y={306} className="sc-mono">
          <tspan className="sc-ng-text">1</tspan>
          {' 00000000    (0)'}
        </text>
        <text x={440} y={306} className="sc-small">
          ← 9桁目はあふれて消える
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={320} y={252} textAnchor="middle" className="sc-big">
          −128 + 64 + 32 + 8 + 2 = −22
        </text>
        <text x={320} y={282} textAnchor="middle" className="sc-small">
          いちばん左の電球（符号ビット）が点いていたら、マイナスの数
        </text>
      </g>
    </g>
  )
}

export const radixScene: Scene = {
  label: '8個の電球で、22 と −22（2の補数）を表す',
  Stage,
  beats: [
    { say: '電球が8個並んでいます。左から 128, 64, 32 … 1 の「重み」があり、点いている電球の重みを足した数を表します。' },
    { say: '22 を表すには、16 と 4 と 2 の電球を点けます。これが 2進数の 00010110 です。', formula: '22 = 16 + 4 + 2 → 00010110' },
    { say: '次に −22 を作ります。まず、全部の電球を反対にします（点いているものは消し、消えているものは点ける）。', formula: '00010110 → 11101001（反転）' },
    { say: 'さいごに 1 を足します。右はしは 1+1 で繰り上がり、その左が 1 になります。これが −22 の「2の補数」です。', formula: '11101001 + 1 = 11101010' },
    {
      say: '確かめます。22 と −22 を足すと、8個からあふれた 9桁目が捨てられ、ちょうど 0 になります。だからマイナスとして使えます。',
      formula: '00010110 + 11101010 = (1)00000000',
    },
    { say: 'いちばん左の重みを −128 と見ると、そのまま −22 と読めます。左はしが点いていればマイナスの数です。', formula: '−128 + 64 + 32 + 8 + 2 = −22' },
  ],
}
