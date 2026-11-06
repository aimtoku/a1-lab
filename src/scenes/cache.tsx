import type { CSSProperties } from 'react'
import type { Scene } from './types'
import { Person, at, grow, shown } from './parts'

/** 箱（データ）を from から to まで運ぶ。表示されるたびに最初から動く */
function Travel({ from, to }: { from: readonly [number, number]; to: readonly [number, number] }) {
  const style = { '--fx': `${from[0]}px`, '--fy': `${from[1]}px`, '--tx': `${to[0]}px`, '--ty': `${to[1]}px` } as CSSProperties
  return (
    <g className="sc-travel" style={style}>
      <rect x={-11} y={-11} width={22} height={22} rx={4} className="sc-data" />
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const tiles = beat >= 3
  return (
    <g>
      {/* 机で作業する人（CPU） */}
      <g className="sc-move" style={{ ...at(0, tiles ? -90 : 0), ...shown(true) }}>
        <Person x={60} y={150} />
        <text x={56} y={252} textAnchor="middle" className="sc-small">
          CPU（人）
        </text>
        <rect x={20} y={206} width={140} height={8} rx={3} className="sc-desk" />
        {/* 手元の棚（キャッシュ） */}
        <rect x={100} y={136} width={60} height={70} rx={6} className="sc-shelf" />
        <line x1={100} y1={171} x2={160} y2={171} className="sc-line" />
        <text x={130} y={128} textAnchor="middle" className="sc-small">
          手元の棚
        </text>
        <text x={160} y={252} textAnchor="middle" className="sc-title">
          キャッシュ 10ns
        </text>

        {/* 遠い倉庫（主記憶） */}
        <path d="M 470 216 V 146 L 530 106 L 590 146 V 216 Z" className="sc-house" />
        <rect x={510} y={176} width={40} height={40} className="sc-panel" />
        <text x={530} y={252} textAnchor="middle" className="sc-title">
          主記憶 60ns
        </text>
        <path d="M 170 220 H 460" className="sc-road" />
        <text x={315} y={212} textAnchor="middle" className="sc-small">
          遠い
        </text>
      </g>

      {/* 運ばれるデータ：場面が変わるたびに、取りに行った場所から机まで運ぶ */}
      {(beat === 1 || beat === 2) && <Travel key={beat} from={beat === 1 ? [130, 156] : [530, 210]} to={[60, 186]} />}
      <g className="sc-fade" style={shown(beat === 1)}>
        <Tagline x={330} y={70} text="棚にあった（ヒット）→ すぐ取れる 10ns" ok />
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <Tagline x={330} y={70} text="棚になかった（ミス）→ 倉庫まで行く 60ns" />
      </g>

      {/* 10回分のタイル */}
      <g className="sc-fade" style={shown(tiles)}>
        {Array.from({ length: 10 }, (_, i) => {
          const miss = i === 6
          return (
            <g key={i}>
              <rect x={40 + i * 56} y={236} width={48} height={48} rx={8} className={miss ? 'sc-tag-ng' : 'sc-tag-ok'} />
              <text x={64 + i * 56} y={266} textAnchor="middle" className="sc-text">
                {miss ? '60' : '10'}
              </text>
            </g>
          )
        })}
        <text x={40} y={224} className="sc-small">
          10回 読んだ時間（ns）：緑＝ヒット、赤＝ミス
        </text>
        <g className="sc-fade" style={shown(beat === 3)}>
          <text x={320} y={322} textAnchor="middle" className="sc-big">
            合計 10×9 + 60×1 = 150ns
          </text>
        </g>
        <g className="sc-fade" style={shown(beat === 4)}>
          <text x={320} y={322} textAnchor="middle" className="sc-big">
            1回あたり 150 ÷ 10 = 15ns
          </text>
        </g>
      </g>

      {/* ヒット率による違い */}
      <g className="sc-fade" style={shown(beat === 5)}>
        <rect x={0} y={292} width={640} height={68} className="sc-cover" />
        <Bar y={298} label="ヒット率 90%" value={15} />
        <Bar y={328} label="ヒット率 99%" value={10.5} />
      </g>
    </g>
  )
}

function Tagline({ x, y, text, ok = false }: { x: number; y: number; text: string; ok?: boolean }) {
  return (
    <g>
      <rect x={x - 190} y={y - 22} width={380} height={34} rx={17} className={ok ? 'sc-tag-ok' : 'sc-tag-ng'} />
      <text x={x} y={y + 1} textAnchor="middle" className="sc-text">
        {text}
      </text>
    </g>
  )
}

function Bar({ y, label, value }: { y: number; label: string; value: number }) {
  return (
    <g>
      <text x={130} y={y + 18} textAnchor="end" className="sc-text">
        {label}
      </text>
      <rect x={144} y={y + 2} width={400} height={22} rx={6} className="sc-off" />
      <rect x={144} y={y + 2} width={400} height={22} rx={6} className="sc-accent sc-grow" style={grow(value / 20)} />
      <text x={556} y={y + 19} className="sc-title">
        {value}ns
      </text>
    </g>
  )
}

export const cacheScene: Scene = {
  label: '机の人（CPU）が、手元の棚（キャッシュ）と遠い倉庫（主記憶）からデータを取る',
  Stage,
  beats: [
    { say: 'CPU を、机で作業する人にたとえます。手元の小さな棚（キャッシュ）は近くて速く、遠い倉庫（主記憶）は大きいけれど遅い場所です。' },
    { say: '欲しいデータが手元の棚にあれば「ヒット」。手を伸ばすだけなので 10ns で取れます。' },
    { say: '棚になければ「ミス」。遠い倉庫まで取りに行くので 60ns かかります。' },
    { say: '10回読んで、9回がヒット、1回がミスだったとします。かかった時間を全部足すと 150ns です。', formula: '10 × 9 + 60 × 1 = 150' },
    { say: '1回あたりにならすと 15ns。これが「実効アクセス時間」です。ヒット率を使って一度に計算できます。', formula: '0.9 × 10 + (1 − 0.9) × 60 = 15' },
    { say: 'ヒット率を 99% に上げると 10.5ns。倉庫へ行く回数が減るほど、キャッシュの速さに近づきます。', formula: '0.99 × 10 + 0.01 × 60 = 10.5' },
  ],
}
