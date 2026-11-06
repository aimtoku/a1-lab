import type { Scene } from './types'
import { grow, shown } from './parts'

const X0 = 110
const U = 46
const tx = (t: number) => X0 + t * U

const TX = [
  { id: 'T1', from: 1, to: 3, row: 0 },
  { id: 'T2', from: 5, to: 8, row: 1 },
  { id: 'T3', from: 6, to: 9, row: 2, open: true },
] as const
const ROW_Y = [70, 140, 210]

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {Array.from({ length: 11 }, (_, t) => (
        <g key={t}>
          <line x1={tx(t)} y1={50} x2={tx(t)} y2={266} className="sc-grid" />
          <text x={tx(t)} y={282} textAnchor="middle" className="sc-small">
            {t}
          </text>
        </g>
      ))}
      <text x={tx(10) + 14} y={282} className="sc-small">
        時刻
      </text>
      {TX.map((t) => (
        <g key={t.id}>
          <text x={X0 - 16} y={ROW_Y[t.row]! + 26} textAnchor="end" className="sc-title">
            {t.id}
          </text>
          <rect x={tx(t.from)} y={ROW_Y[t.row]!} width={(t.to - t.from) * U} height={40} rx={8} className="sc-bar" />
          <text x={tx(t.from) + 10} y={ROW_Y[t.row]! + 26} className="sc-small">
            {'open' in t ? '実行中（未完了）' : '完了'}
          </text>
          {!('open' in t) && <circle cx={tx(t.to)} cy={ROW_Y[t.row]! + 20} r={7} className="sc-ok" />}
        </g>
      ))}

      {/* チェックポイント */}
      <g className="sc-fade" style={shown(beat >= 1)}>
        <line x1={tx(4)} y1={44} x2={tx(4)} y2={262} className="sc-accent-stroke" />
        <text x={tx(4)} y={36} textAnchor="middle" className="sc-title">
          チェックポイント
        </text>
        <rect x={tx(4) - 52} y={292} width={104} height={30} rx={6} className="sc-panel" />
        <text x={tx(4)} y={312} textAnchor="middle" className="sc-small">
          ディスクへ保存
        </text>
      </g>
      {/* 障害 */}
      <g className="sc-fade" style={shown(beat >= 2)}>
        <path d={`M ${tx(9) + 4} 40 l -14 40 h 12 l -10 36 l 26 -48 h -12 l 10 -28 Z`} className="sc-bolt" />
        <line x1={tx(9)} y1={116} x2={tx(9)} y2={262} className="sc-red-stroke" strokeDasharray="6 5" />
        <text x={tx(9) + 22} y={60} className="sc-title sc-ng-text">
          停止
        </text>
      </g>

      {/* 回復の矢印 */}
      <g className="sc-fade" style={shown(beat >= 3)}>
        <text x={tx(4) + 10} y={ROW_Y[0]! + 26} className="sc-title sc-ok-text">
          何もしない
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 4)}>
        <rect x={tx(4)} y={ROW_Y[1]! + 46} width={(8 - 4) * U} height={10} rx={4} className="sc-forward sc-grow" style={grow(beat >= 4 ? 1 : 0)} />
        <text x={tx(9) + 12} y={ROW_Y[1]! + 56} className="sc-title sc-ok-text">
          → やり直す
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 5)}>
        <path d={`M ${tx(9)} ${ROW_Y[2]! + 50} H ${tx(6) + 6}`} className="sc-back" markerEnd="url(#sc-rc-arrow)" />
        <text x={tx(9) + 12} y={ROW_Y[2]! + 56} className="sc-title sc-ng-text">
          ← 取り消す
        </text>
      </g>
      <defs>
        <marker id="sc-rc-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" className="sc-ng" />
        </marker>
      </defs>
      <g className="sc-fade" style={shown(beat === 6)}>
        <text x={320} y={350} textAnchor="middle" className="sc-title">
          終わった仕事は「更新後ログ」で進め、終わっていない仕事は「更新前ログ」で戻す
        </text>
      </g>
    </g>
  )
}

export const recoveryScene: Scene = {
  label: '時刻4に保存（チェックポイント）、時刻9に停止。3つの処理を、何もしない・やり直す・取り消すに分ける',
  Stage,
  beats: [
    { say: '3つの処理（トランザクション）の流れです。T1 と T2 は完了し、T3 はまだ実行の途中です。' },
    { say: '時刻4に、それまでの更新をまとめてディスクに書き出しました（チェックポイント）。ゲームのセーブのようなものです。' },
    { say: '時刻9に、障害でシステムが止まりました。メモリの中にしかなかった更新は消えてしまいます。' },
    { say: 'T1 はセーブより前に完了しているので、ディスクに書かれています。何もしなくてかまいません。' },
    {
      say: 'T2 は完了していますが、セーブのあとの更新はディスクにないかもしれません。「更新後」の記録（ログ）を使って、更新をやり直します（ロールフォワード）。',
    },
    { say: 'T3 は終わっていないので、途中までの更新は全部なかったことにします。「更新前」の記録で元の値に戻します（ロールバック）。' },
    { say: '完了したものは進める、完了していないものは戻す。こうして「全部やったか、何もしなかったか」のどちらかにそろえます（原子性）。' },
  ],
}
