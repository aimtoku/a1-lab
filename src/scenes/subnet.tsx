import type { Scene } from './types'
import { shown } from './parts'

const X0 = 150
const DX = 50

/** 場面ごとの、最後の8ビットの行 */
interface Row {
  label: string
  bits: string
  value: string
}

const ROWS: readonly Row[][] = [
  [],
  [{ label: 'マスク（/26）', bits: '11000000', value: '192' }],
  [
    { label: 'マスク（/26）', bits: '11000000', value: '192' },
    { label: '75', bits: '01001011', value: '75' },
  ],
  [
    { label: '75', bits: '01001011', value: '75' },
    { label: 'ホスト部を全部0', bits: '01000000', value: '64' },
  ],
  [
    { label: '75', bits: '01001011', value: '75' },
    { label: 'ホスト部を全部1', bits: '01111111', value: '127' },
  ],
  [],
]

/** 0〜255 の帯 */
const bx = (v: number) => 40 + (v / 256) * 560

function Stage({ beat }: { beat: number }) {
  const rows = ROWS[beat]!
  const split = beat >= 2 && beat <= 4
  return (
    <g>
      <text x={320} y={40} textAnchor="middle" className="sc-big">
        192.168.10.<tspan className="sc-ng-text">75</tspan> /26
      </text>
      <g className="sc-fade" style={shown(beat === 0)}>
        <text x={320} y={90} textAnchor="middle" className="sc-text">
          最初の 26ビットが「どのネットワーク（建物）か」、残りが「どの機器（部屋）か」
        </text>
        {Array.from({ length: 32 }, (_, i) => (
          <rect key={i} x={40 + i * 17.5} y={120} width={15} height={40} rx={3} className={i < 26 ? 'sc-net' : 'sc-host'} />
        ))}
        <text x={40 + 13 * 17.5} y={190} textAnchor="middle" className="sc-title">
          ネットワーク部 26ビット
        </text>
        <text x={40 + 29 * 17.5} y={190} textAnchor="middle" className="sc-title">
          ホスト部 6
        </text>
        <text x={320} y={250} textAnchor="middle" className="sc-small">
          計算に使うのは、境目のある最後の8ビット（75 の部分）だけ
        </text>
      </g>

      {/* 最後の8ビットの行 */}
      {rows.map((r, j) => (
        <g key={`${beat}-${j}`} className="sc-pop">
          <text x={X0 - 14} y={108 + j * 70} textAnchor="end" className="sc-title">
            {r.label}
          </text>
          {[...r.bits].map((b, i) => (
            <g key={i}>
              <rect
                x={X0 + i * DX}
                y={80}
                width={46}
                height={46}
                rx={6}
                transform={`translate(0 ${j * 70})`}
                className={split ? (i < 2 ? 'sc-net' : 'sc-host') : b === '1' ? 'sc-on' : 'sc-off'}
              />
              <text x={X0 + i * DX + 23} y={111 + j * 70} textAnchor="middle" className="sc-big">
                {b}
              </text>
            </g>
          ))}
          <text x={X0 + 8 * DX + 12} y={111 + j * 70} className="sc-big">
            = {r.value}
          </text>
        </g>
      ))}
      <g className="sc-fade" style={shown(split)}>
        <text x={X0 + DX} y={232} textAnchor="middle" className="sc-small">
          ネットワーク部（2ビット）
        </text>
        <text x={X0 + 5 * DX} y={232} textAnchor="middle" className="sc-small">
          ホスト部（6ビット）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 1)}>
        <text x={320} y={220} textAnchor="middle" className="sc-text">
          最後の8ビットのうち、先頭2ビットまでが1（24 + 2 = 26）
        </text>
        <text x={320} y={250} textAnchor="middle" className="sc-title">
          サブネットマスク 255.255.255.192
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <text x={320} y={280} textAnchor="middle" className="sc-big sc-ok-text">
          ネットワークアドレス 192.168.10.64
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={320} y={280} textAnchor="middle" className="sc-big sc-ok-text">
          ブロードキャストアドレス 192.168.10.127
        </text>
      </g>

      {/* 0〜255 の帯 */}
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={320} y={90} textAnchor="middle" className="sc-text">
          最後の数（0〜255）を 64個ずつに区切ると…
        </text>
        {[0, 64, 128, 192].map((v) => (
          <g key={v}>
            <rect x={bx(v) + 1} y={120} width={(64 / 256) * 560 - 2} height={50} rx={6} className={v === 64 ? 'sc-hot' : 'sc-off'} />
            <text x={bx(v)} y={192} textAnchor="middle" className="sc-small">
              {v}
            </text>
          </g>
        ))}
        <text x={bx(256)} y={192} textAnchor="middle" className="sc-small">
          256
        </text>
        <text x={bx(96)} y={151} textAnchor="middle" className="sc-title">
          64〜127
        </text>
        <text x={bx(96)} y={112} textAnchor="middle" className="sc-small">
          75 はここ ↓
        </text>
        <text x={320} y={240} textAnchor="middle" className="sc-text">
          64個のうち、最初の .64 と最後の .127 は、機器には使えない
        </text>
        <text x={320} y={286} textAnchor="middle" className="sc-big sc-ok-text">
          機器に付けられるのは 62個（.65〜.126）
        </text>
      </g>
    </g>
  )
}

export const subnetScene: Scene = {
  label: '192.168.10.75/26 の最後の8ビットを、ネットワーク部とホスト部に分けて計算する',
  Stage,
  beats: [
    {
      say: 'IPアドレスは 32ビット。/26 は「先頭の 26ビットがネットワーク（建物）、残り 6ビットが機器（部屋番号）」という意味です。境目は最後の8ビットの中にあります。',
    },
    { say: '/26 をマスクに直します。最後の8ビットは、先頭2ビットだけが 1 の 11000000、10進数で 192 です。', formula: '/26 → 255.255.255.192' },
    {
      say: '75 を2進数にすると 01001011。マスクの 1 の部分（先頭2ビット）がネットワーク部、残り6ビットがホスト部です。',
      formula: '75 = 64 + 8 + 2 + 1 → 01001011',
    },
    { say: 'ホスト部を全部 0 にすると 01000000 = 64。これが、この建物そのものを表すネットワークアドレスです。', formula: '192.168.10.64' },
    { say: 'ホスト部を全部 1 にすると 01111111 = 127。建物の全員に届けるブロードキャストアドレスです。', formula: '192.168.10.127' },
    { say: 'ホスト部が6ビットなので、建物の中のアドレスは 64個。最初と最後は特別な用途なので、機器に付けられるのは 62個です。', formula: '2⁶ − 2 = 62' },
  ],
}
