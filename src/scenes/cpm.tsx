import type { Scene } from './types'
import { grow, shown } from './parts'

const X0 = 150
const DAY = 36
const dx = (d: number) => X0 + d * DAY

interface Task {
  id: string
  name: string
  start: number
  len: number
  row: number
  /** この場面から伸び始める */
  from: number
  critical: boolean
}

const TASKS: readonly Task[] = [
  { id: 'A', name: '看板設計', start: 0, len: 3, row: 0, from: 1, critical: false },
  { id: 'C', name: '看板製作', start: 3, len: 2, row: 0, from: 1, critical: false },
  { id: 'B', name: '衣装採寸', start: 0, len: 4, row: 1, from: 2, critical: true },
  { id: 'D', name: '衣装製作', start: 4, len: 5, row: 1, from: 2, critical: true },
  { id: 'E', name: 'リハーサル', start: 9, len: 3, row: 2, from: 4, critical: true },
]
const ROW_Y = [78, 158, 238]
const ROWS = ['看板チーム', '衣装チーム', '全員']

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {/* 日付の目盛り */}
      {Array.from({ length: 13 }, (_, d) => (
        <g key={d}>
          <line x1={dx(d)} y1={60} x2={dx(d)} y2={300} className="sc-grid" />
          <text x={dx(d)} y={320} textAnchor="middle" className="sc-small">
            {d}
          </text>
        </g>
      ))}
      <text x={dx(12) + 14} y={320} className="sc-small">
        日目
      </text>
      {ROWS.map((r, i) => (
        <text key={r} x={X0 - 14} y={ROW_Y[i]! + 30} textAnchor="end" className="sc-title">
          {r}
        </text>
      ))}

      {TASKS.map((t) => {
        const on = beat >= t.from
        const red = beat >= 5 && t.critical
        return (
          <g key={t.id}>
            <rect
              x={dx(t.start) + 2}
              y={ROW_Y[t.row]!}
              width={t.len * DAY - 4}
              height={46}
              rx={8}
              className={`sc-grow sc-color ${red ? 'sc-bar-critical' : 'sc-bar'}`}
              style={grow(on ? 1 : 0)}
            />
            <g className="sc-fade" style={shown(on)}>
              <text x={dx(t.start + t.len / 2)} y={ROW_Y[t.row]! + 21} textAnchor="middle" className="sc-bar-text">
                {t.name}
              </text>
              <text x={dx(t.start + t.len / 2)} y={ROW_Y[t.row]! + 38} textAnchor="middle" className="sc-bar-text">
                {t.id}・{t.len}日
              </text>
            </g>
          </g>
        )
      })}

      {/* 看板チームの待ち時間（余裕） */}
      <g className="sc-fade" style={shown(beat >= 3)}>
        <rect x={dx(5) + 2} y={ROW_Y[0]!} width={4 * DAY - 4} height={46} rx={8} className="sc-wait" />
        <text x={dx(7)} y={ROW_Y[0]! + 28} textAnchor="middle" className="sc-title">
          待ち 4日（余裕）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 3)}>
        <line x1={dx(9)} y1={60} x2={dx(9)} y2={300} className="sc-red-stroke" />
        <text x={dx(9)} y={54} textAnchor="middle" className="sc-title sc-ng-text">
          そろうのは 9日目
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 4)}>
        <text x={dx(12)} y={54} textAnchor="middle" className="sc-title">
          完成 12日目
        </text>
      </g>
      <g className="sc-fade" style={shown(beat >= 5)}>
        <text x={20} y={350} className="sc-title sc-ng-text">
          赤い道（採寸 → 製作 → リハーサル）がクリティカルパス
        </text>
      </g>
    </g>
  )
}

export const cpmScene: Scene = {
  label: '文化祭の準備で、看板と衣装を同時に進め、全体の日数とクリティカルパスを見つける',
  Stage,
  beats: [
    { say: '文化祭の準備です。看板は「設計3日 → 製作2日」、衣装は「採寸4日 → 製作5日」。看板と衣装が両方そろったら、リハーサルを3日します。' },
    { say: '看板と衣装は別のチームなので、同時に進められます。看板チームは 3 + 2 = 5日目に終わります。', formula: '3 + 2 = 5' },
    { say: '衣装チームは 4 + 5 = 9日目に終わります。', formula: '4 + 5 = 9' },
    {
      say: 'リハーサルは両方そろうまで始められません。そろうのは遅いほうの 9日目。看板チームは 4日待つことになります。この待てる日数が「余裕（フロート）」です。',
      formula: '9 − 5 = 4（余裕）',
    },
    { say: '9日目からリハーサルを3日して、全体は 12日目に完成します。', formula: '9 + 3 = 12' },
    {
      say: '衣装の道は1日も余裕がなく、どこかが遅れると完成も遅れます。この道がクリティカルパスです。看板は4日までなら遅れても大丈夫です。',
      formula: '4 + 5 + 3 = 12日（最長の道 ＝ 全体の日数）',
    },
  ],
}
