import type { Scene } from './types'
import { Person, shown } from './parts'

type Who = 'T1' | 'T2' | null
interface State {
  x: Who
  y: Who
  /** 待っている矢印 */
  wait: readonly ('T1→Y' | 'T2→X')[]
  done?: readonly ('T1' | 'T2')[]
}

const STATES: readonly State[] = [
  { x: null, y: null, wait: [] },
  { x: 'T1', y: null, wait: [] },
  { x: 'T1', y: 'T2', wait: [] },
  { x: 'T1', y: 'T2', wait: ['T1→Y', 'T2→X'] },
  { x: 'T1', y: 'T1', wait: ['T2→X'] },
  { x: 'T1', y: null, wait: [], done: ['T1'] },
]

function Locker({ x, name, owner }: { x: number; name: string; owner: Who }) {
  return (
    <g>
      <rect x={x - 50} y={130} width={100} height={110} rx={10} className="sc-panel" />
      <text x={x} y={200} textAnchor="middle" className="sc-big">
        {name}
      </text>
      <g className="sc-fade" style={shown(owner !== null)}>
        <path d={`M ${x - 12} 128 V 116 a 12 12 0 0 1 24 0 V 128`} className={owner === 'T1' ? 'sc-shackle-1' : 'sc-shackle-2'} />
        <rect x={x - 18} y={126} width={36} height={28} rx={5} className={owner === 'T1' ? 'sc-lock-1' : 'sc-lock-2'} />
        <text x={x} y={145} textAnchor="middle" className="sc-person-label" fontSize={11}>
          {owner ?? ''}
        </text>
      </g>
      <text x={x} y={262} textAnchor="middle" className="sc-small">
        データ {name}
      </text>
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const s = STATES[beat]!
  const cycle = s.wait.length === 2
  return (
    <g>
      <Person x={90} y={150} label="T1" />
      <Person x={550} y={150} label="T2" />
      <Locker x={250} name="X" owner={s.x} />
      <Locker x={390} name="Y" owner={s.y} />
      {/* 鍵をかけた線 */}
      <g className="sc-fade" style={shown(s.x === 'T1')}>
        <path d="M 112 180 H 200" className="sc-own-1" />
      </g>
      <g className="sc-fade" style={shown(s.y === 'T2')}>
        <path d="M 528 180 H 440" className="sc-own-2" />
      </g>
      <g className="sc-fade" style={shown(s.y === 'T1')}>
        <path d="M 112 205 Q 230 330 350 238" className="sc-own-1" />
      </g>
      {/* 待ちの線 */}
      <g className="sc-fade" style={shown(s.wait.includes('T1→Y'))}>
        <path d="M 100 120 Q 250 30 380 126" className={cycle ? 'sc-wait-red' : 'sc-wait-line'} />
        <text x={250} y={62} textAnchor="middle" className="sc-small">
          T1：Y を使いたい…待ち
        </text>
      </g>
      <g className="sc-fade" style={shown(s.wait.includes('T2→X'))}>
        <path d="M 540 120 Q 390 30 260 126" className={cycle ? 'sc-wait-red' : 'sc-wait-line'} />
        <text x={390} y={44} textAnchor="middle" className="sc-small">
          T2：X を使いたい…待ち
        </text>
      </g>
      <g className="sc-fade" style={shown(cycle)}>
        <text x={320} y={320} textAnchor="middle" className="sc-big sc-ng-text">
          お互いに相手を待って、どちらも進めない
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={320} y={320} textAnchor="middle" className="sc-title">
          T2 を取り消し（ロールバック）→ T1 が Y を使って先に終わる
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={320} y={312} textAnchor="middle" className="sc-title sc-ok-text">
          防ぐには：みんな同じ順番（X → Y）で鍵をかける
        </text>
        <text x={320} y={338} textAnchor="middle" className="sc-small">
          T2 も X から取りに行くので、T1 が終わるのを待つだけ。輪にならない
        </text>
      </g>
    </g>
  )
}

export const deadlockScene: Scene = {
  label: '2人が2つのロッカーに逆の順で鍵をかけ、お互いを待って動けなくなる（デッドロック）',
  Stage,
  beats: [
    {
      say: 'T1 と T2 の2つの処理（トランザクション）が、データ X と Y の両方を書き換えようとしています。書き換える間は、鍵（ロック）をかけて他の人に触らせません。',
    },
    { say: 'T1 は先に X を使うので、X に鍵をかけます。' },
    { say: 'ちょうど同じころ、T2 は Y を先に使うので、Y に鍵をかけます。' },
    { say: '次に T1 は Y を、T2 は X を使いたいのですが、どちらも相手が鍵を持っています。お互いに待ち続けて進めません。これがデッドロックです。' },
    {
      say: '起きてしまったら、DBMS が片方（ここでは T2）を取り消して鍵を外させます（ロールバック）。T1 は Y も使えるようになり、先に終わります。T2 はあとでやり直します。',
    },
    { say: '防ぐには、全員が同じ順番（X → Y）で鍵をかけると決めます。そうすれば待ちが輪になることはありません。' },
  ],
}
