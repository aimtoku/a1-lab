import type { Scene } from './types'
import { grow, shown } from './parts'

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {/* ファイル */}
      <g>
        <path d="M 40 70 H 100 L 120 90 V 170 H 40 Z" className="sc-doc" />
        <text x={80} y={124} textAnchor="middle" className="sc-title">
          600 MB
        </text>
        <text x={80} y={196} textAnchor="middle" className="sc-small">
          ファイル（バイト）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 1)}>
        <text x={80} y={226} textAnchor="middle" className="sc-small">
          × 8
        </text>
        <text x={80} y={252} textAnchor="middle" className="sc-title sc-ok-text">
          4,800 Mビット
        </text>
      </g>

      {/* 回線（パイプ） */}
      <g className="sc-fade" style={shown(beat >= 2)}>
        <rect x={170} y={90} width={400} height={80} rx={40} className="sc-pipe" />
        <clipPath id="sc-tr-pipe">
          <rect x={170} y={90} width={400} height={80} rx={40} />
        </clipPath>
        <g clipPath="url(#sc-tr-pipe)" className="sc-fade" style={shown(beat >= 3)}>
          <rect x={170} y={90} width={400} height={80} className="sc-pipe-ctrl" />
          <rect x={170} y={122} width={400} height={48} className="sc-pipe-data" />
        </g>
        <rect x={170} y={90} width={400} height={80} rx={40} className="sc-pipe-edge" />
        <text x={370} y={74} textAnchor="middle" className="sc-title">
          回線 1 Gbps ＝ 1秒に 1,000 Mビット
        </text>
        <g className="sc-fade" style={shown(beat >= 3)}>
          <text x={370} y={112} textAnchor="middle" className="sc-small">
            制御の情報・すき間（40%）
          </text>
          <text x={370} y={152} textAnchor="middle" className="sc-title">
            データを運べるのは 60% ＝ 600 Mbps
          </text>
        </g>
      </g>

      {/* 時間 */}
      <g className="sc-fade" style={shown(beat >= 4)}>
        <text x={170} y={226} className="sc-small">
          送った量
        </text>
        <rect x={170} y={236} width={400} height={30} rx={8} className="sc-off" />
        <rect x={170} y={236} width={400} height={30} rx={8} className="sc-margin sc-grow-slow" style={grow(beat >= 4 ? 1 : 0)} />
        {Array.from({ length: 9 }, (_, i) => (
          <text key={i} x={170 + i * 50} y={288} textAnchor="middle" className="sc-small">
            {i}秒
          </text>
        ))}
        <text x={370} y={330} textAnchor="middle" className="sc-big sc-ok-text">
          4,800 ÷ 600 = 8秒
        </text>
      </g>
    </g>
  )
}

export const transferScene: Scene = {
  label: '600 Mバイトのファイルを、1 Gbps のうち 60% だけデータに使える回線で送る時間',
  Stage,
  beats: [
    { say: '600 Mバイトのファイルを、1 Gbps の回線で送ります。かかる時間は「送る量 ÷ 1秒に運べる量」です。まず単位をそろえます。' },
    { say: '回線の速さはビットで数えるので、ファイルもビットに直します。1バイトは8ビットなので、8倍します。', formula: '600 Mバイト × 8 = 4,800 Mビット' },
    { say: '1 Gbps は、1秒に 1,000 Mビット運べる太さの管（回線）です。' },
    {
      say: 'ただし管の全部をデータに使えるわけではありません。制御の情報やすき間があり、伝送効率 60% なら、データに使えるのは 600 Mbps です。',
      formula: '1,000 Mbps × 0.6 = 600 Mbps',
    },
    {
      say: '4,800 Mビットを 1秒に 600 Mビットずつ送るので、8秒かかります。単位（ビットとバイト、k・M・G）を取り違えないことが大切です。',
      formula: '4,800 ÷ 600 = 8秒',
    },
  ],
}
