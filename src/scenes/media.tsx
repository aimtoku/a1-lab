import type { Scene } from './types'
import { shown } from './parts'

/** 音の波（x は 0〜1） */
const wave = (t: number) => Math.sin(t * Math.PI * 4) * 0.7 + Math.sin(t * Math.PI * 10) * 0.25
const W0 = 60
const WW = 520
const MID = 120
const AMP = 70
const LEVELS = 8

function wavePath(y0: number, amp: number) {
  let d = ''
  for (let i = 0; i <= 200; i++) {
    const t = i / 200
    d += `${i === 0 ? 'M' : 'L'} ${W0 + t * WW} ${y0 - wave(t) * amp} `
  }
  return d
}

const SAMPLES = Array.from({ length: 21 }, (_, i) => i / 20)
const snap = (v: number) => (Math.round(((v + 1) / 2) * (LEVELS - 1)) / (LEVELS - 1)) * 2 - 1

const CHIPS = ['44,100回/秒', '× 16ビット', '× 2チャネル', '× 60秒']

function Stage({ beat }: { beat: number }) {
  const stereo = beat >= 3
  const calc = beat >= 4
  return (
    <g>
      <g className="sc-fade" style={shown(!calc)}>
        {/* 量子化の目盛り */}
        <g className="sc-fade" style={shown(beat === 2)}>
          {Array.from({ length: LEVELS }, (_, k) => {
            const y = MID - ((k / (LEVELS - 1)) * 2 - 1) * AMP
            return <line key={k} x1={W0} y1={y} x2={W0 + WW} y2={y} className="sc-grid" />
          })}
          <text x={W0 + WW + 6} y={MID - AMP + 4} className="sc-small">
            段階
          </text>
        </g>
        <path d={wavePath(MID, AMP)} className="sc-wave sc-fade" style={shown(true, beat === 2)} />
        <text x={W0 - 10} y={MID + 4} textAnchor="end" className="sc-small">
          {stereo ? '左' : '音'}
        </text>
        {SAMPLES.map((t, i) => {
          const v = beat === 2 ? snap(wave(t)) : wave(t)
          return (
            <g key={i} className="sc-fade" style={shown(beat >= 1 && beat <= 3)}>
              <line x1={W0 + t * WW} y1={MID} x2={W0 + t * WW} y2={MID - v * AMP} className="sc-sample" />
              <circle cx={W0 + t * WW} cy={MID - v * AMP} r={4.5} className="sc-dot sc-color" />
            </g>
          )
        })}
        <g className="sc-fade" style={shown(stereo)}>
          <path d={wavePath(270, -55)} className="sc-wave" />
          <text x={W0 - 10} y={274} textAnchor="end" className="sc-small">
            右
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 1)}>
          <text x={320} y={260} textAnchor="middle" className="sc-big">
            1秒に 44,100回、波の高さを測る
          </text>
          <text x={320} y={288} textAnchor="middle" className="sc-small">
            （図は間引いて描いています）
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 2)}>
          <text x={320} y={260} textAnchor="middle" className="sc-big">
            測った高さを、決まった段階に丸める
          </text>
          <text x={320} y={288} textAnchor="middle" className="sc-small">
            16ビットなら 65,536段階（図は8段階で描いています）
          </text>
        </g>
      </g>

      {/* 掛け算 */}
      <g className="sc-fade" style={shown(calc)}>
        {CHIPS.map((c, i) => (
          <g key={c}>
            <rect x={30 + i * 148} y={60} width={136} height={50} rx={10} className="sc-hot" />
            <text x={98 + i * 148} y={92} textAnchor="middle" className="sc-title">
              {c}
            </text>
          </g>
        ))}
        <text x={320} y={170} textAnchor="middle" className="sc-big">
          = 84,672,000 ビット
        </text>
        <g className="sc-fade" style={shown(beat >= 5)}>
          <text x={320} y={226} textAnchor="middle" className="sc-text">
            ÷ 8（8ビット = 1バイト）
          </text>
          <text x={320} y={270} textAnchor="middle" className="sc-big sc-ok-text">
            = 10,584,000 バイト ≒ 約 10.6 Mバイト
          </text>
          <text x={320} y={306} textAnchor="middle" className="sc-small">
            4分の曲なら、約 42 Mバイト
          </text>
        </g>
      </g>
    </g>
  )
}

export const mediaSizeScene: Scene = {
  label: '音の波を1秒に何回も測り、決まった段階に丸めて数にし、データ量を掛け算で求める',
  Stage,
  beats: [
    { say: '音は空気の波です。コンピュータで扱うには、この波を数の並びに直します。音楽CDと同じ品質の音声1分ぶんのデータ量を求めます。' },
    { say: '標本化：波の高さを、決まった間隔で測ります。音楽CDは 1秒に 44,100回（44.1 kHz）測ります。' },
    { say: '量子化：測った高さを、決まった段階のどれかに丸めて数にします。16ビットなら 65,536段階です。1回の値が 16ビットになります。' },
    { say: 'ステレオは左右の2つの音（2チャネル）を別々に記録します。時間は 60秒です。' },
    { say: '全部を掛け算すると、1分ぶんのビット数が出ます。', formula: '44,100 × 16 × 2 × 60 = 84,672,000 ビット' },
    {
      say: '8ビットで1バイトなので、8で割ると約 10.6 Mバイトです。単位がビットかバイトかを、問題文で必ず確かめます。',
      formula: '84,672,000 ÷ 8 = 10,584,000 バイト ≒ 10.6 Mバイト',
    },
  ],
}
