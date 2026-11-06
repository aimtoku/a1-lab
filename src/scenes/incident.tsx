import type { Scene } from './types'
import { Person, shown } from './parts'

const ACTORS = [
  { x: 60, label: '利用者' },
  { x: 200, label: 'サービスデスク' },
  { x: 340, label: '技術者' },
]

function Server({ ok }: { ok: boolean }) {
  return (
    <g>
      <rect x={480} y={60} width={110} height={120} rx={8} className="sc-panel" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={494} y={74 + i * 34} width={82} height={24} rx={4} className="sc-off" />
      ))}
      <circle cx={566} cy={86} r={7} className={`sc-color ${ok ? 'sc-ok' : 'sc-ng'}`} />
      <text x={535} y={200} textAnchor="middle" className="sc-small">
        Webシステム
      </text>
      <text x={535} y={222} textAnchor="middle" className={`sc-title ${ok ? 'sc-ok-text' : 'sc-ng-text'}`}>
        {ok ? '動いている' : 'つながらない'}
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const ok = beat === 2 || beat >= 4
  const mem = beat === 3
  return (
    <g>
      {ACTORS.map((a) => (
        <Person key={a.label} x={a.x} y={70} label={a.label} />
      ))}
      <Server ok={ok} />

      <g className="sc-fade" style={shown(beat === 0)}>
        <text x={60} y={30} textAnchor="middle" className="sc-small">
          「つながらない！」
        </text>
        <path d="M 90 100 H 170" className="sc-accent-stroke" />
      </g>
      <g className="sc-fade" style={shown(beat === 1)}>
        <rect x={140} y={170} width={180} height={80} rx={8} className="sc-panel" />
        <text x={150} y={196} className="sc-small">
          インシデント記録 #102
        </text>
        <text x={150} y={218} className="sc-small">
          影響：全社 ／ 緊急度：高
        </text>
        <text x={150} y={240} className="sc-title sc-ng-text">
          優先度：高
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <path d="M 230 100 H 310" className="sc-accent-stroke" />
        <text x={270} y={90} textAnchor="middle" className="sc-small">
          引き継ぎ
        </text>
        <path d="M 370 100 H 470" className="sc-accent-stroke" />
        <text x={420} y={90} textAnchor="middle" className="sc-small">
          再起動
        </text>
        <text x={320} y={290} textAnchor="middle" className="sc-big">
          原因はまだ不明でも、まず元に戻す
        </text>
      </g>

      {/* 問題管理：メモリのグラフ */}
      <g className="sc-fade" style={shown(mem)}>
        <rect x={140} y={170} width={300} height={130} rx={8} className="sc-panel" />
        <text x={150} y={190} className="sc-small">
          メモリの使用量（何日分か）
        </text>
        <path d="M 160 280 L 220 240 L 220 280 L 290 236 L 290 280 L 360 232 L 360 280 L 420 228" className="sc-stock" />
        <line x1={160} y1={222} x2={430} y2={222} className="sc-red-stroke" strokeDasharray="5 5" strokeWidth={2} />
        <text x={430} y={216} textAnchor="end" className="sc-small">
          上限
        </text>
        <text x={290} y={330} textAnchor="middle" className="sc-title">
          使ったメモリが返されず増え続ける（メモリリーク）が根本原因
        </text>
      </g>

      {/* 変更管理 */}
      <g className="sc-fade" style={shown(beat === 4)}>
        {['変更要求', '影響を評価・承認', 'テスト', '本番へ展開'].map((t, i) => (
          <g key={t}>
            <rect x={30 + i * 150} y={250} width={130} height={44} rx={22} className={i === 1 ? 'sc-hot' : 'sc-panel'} />
            <text x={95 + i * 150} y={277} textAnchor="middle" className="sc-small">
              {t}
            </text>
          </g>
        ))}
        <text x={320} y={330} textAnchor="middle" className="sc-small">
          修正プログラムを、安全に入れる（変更管理 → リリース管理）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        {[
          ['インシデント管理', 'とにかく早く元に戻す'],
          ['問題管理', '根本原因を見つける'],
          ['変更管理', '直し方を安全に入れる'],
        ].map(([a, b], i) => (
          <g key={a}>
            <text x={60} y={276 + i * 28} className="sc-title">
              {a}
            </text>
            <text x={230} y={276 + i * 28} className="sc-text">
              {b}
            </text>
          </g>
        ))}
      </g>
    </g>
  )
}

export const incidentScene: Scene = {
  label: '「つながらない」の連絡から、まず元に戻し、原因を探し、安全に直すまでの流れ',
  Stage,
  beats: [
    { say: '利用者から「社内の Webシステム につながらない」と、窓口（サービスデスク）に連絡が来ました。' },
    { say: 'サービスデスクは、インシデントとして記録します。影響の広さと急ぎ具合から、優先度を「高」に決めます。' },
    {
      say: '窓口では直せないので、専門の技術者に引き継ぎます（エスカレーション）。技術者はサーバを再起動して、まずサービスを元に戻します。原因探しより、復旧が先です。',
    },
    { say: '同じ停止が何度も起きているので、「問題」として根本原因を調べます（問題管理）。メモリが少しずつ増え続けるメモリリークが見つかりました。' },
    { say: '修正プログラムを入れる前に、変更要求として影響とリスクを評価し、承認します（変更管理）。テストしてから本番に展開します（リリース管理）。' },
    { say: '早く戻すのがインシデント管理、原因を見つけるのが問題管理、安全に直すのが変更管理です。役割の違いがよく問われます。' },
  ],
}
