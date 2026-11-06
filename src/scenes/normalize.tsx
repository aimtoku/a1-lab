import type { Scene } from './types'
import { at, shown } from './parts'

interface Col {
  name: string
  key?: boolean
}

/** 表：見出しと行。hot の列は黄色で強調する */
function Table({
  title,
  cols,
  rows,
  w = 78,
  hot = [],
  dup = [],
}: {
  title: string
  cols: readonly Col[]
  rows: readonly (readonly string[])[]
  w?: number
  hot?: readonly number[]
  dup?: readonly number[]
}) {
  return (
    <g>
      <text x={0} y={-8} className="sc-title">
        {title}
      </text>
      {cols.map((c, i) => (
        <g key={c.name}>
          <rect x={i * w} y={0} width={w} height={28} className={hot.includes(i) ? 'sc-hot' : 'sc-th'} />
          <text x={i * w + w / 2} y={19} textAnchor="middle" className={c.key ? 'sc-th-key' : 'sc-th-text'}>
            {c.name}
          </text>
        </g>
      ))}
      {rows.map((r, j) =>
        r.map((v, i) => (
          <g key={`${j}-${i}`}>
            <rect x={i * w} y={28 + j * 28} width={w} height={28} className={dup.includes(i) && j > 0 ? 'sc-dup' : 'sc-td'} />
            <text x={i * w + w / 2} y={47 + j * 28} textAnchor="middle" className="sc-td-text">
              {v}
            </text>
          </g>
        )),
      )}
    </g>
  )
}

const C = (name: string, key = false): Col => ({ name, key })

function Stage({ beat }: { beat: number }) {
  return (
    <g>
      {/* 非正規形：伝票そのまま */}
      <g className="sc-fade" style={{ ...at(20, 90), ...shown(beat === 0) }}>
        <Table
          title="受注の伝票（1行に商品が2つ）"
          w={120}
          cols={[C('受注番号'), C('受注日'), C('顧客コード'), C('顧客名'), C('商品')]}
          rows={[['1001', '11/5', 'K1', '山田商店', 'りんご3,みかん5']]}
          hot={[4]}
        />
      </g>

      {/* 第1正規形 */}
      <g className="sc-fade" style={{ ...at(10, 70), ...shown(beat === 1 || beat === 2) }}>
        <Table
          title="第1正規形：商品ごとに1行"
          w={88}
          cols={[C('受注番号', true), C('受注日'), C('顧客コード'), C('顧客名'), C('商品コード', true), C('商品名'), C('数量')]}
          rows={[
            ['1001', '11/5', 'K1', '山田商店', 'P1', 'りんご', '3'],
            ['1001', '11/5', 'K1', '山田商店', 'P2', 'みかん', '5'],
          ]}
          dup={beat === 1 ? [0, 1, 2, 3] : []}
          hot={beat === 2 ? [1, 2, 3, 5] : []}
        />
      </g>
      <g className="sc-fade" style={shown(beat === 1)}>
        <text x={320} y={210} textAnchor="middle" className="sc-big">
          同じ受注日・顧客名が、商品の数だけ重なる
        </text>
        <text x={320} y={240} textAnchor="middle" className="sc-small">
          下線の列（受注番号＋商品コード）で1行が決まる：主キー
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <path d="M 54 160 V 196 H 318 M 142 196 V 160 M 230 196 V 160 M 318 196 V 160" className="sc-dep" />
        <path d="M 406 160 V 196 H 494 V 160" className="sc-dep" />
        <text x={180} y={226} textAnchor="middle" className="sc-text">
          受注番号だけで決まる
        </text>
        <text x={450} y={226} textAnchor="middle" className="sc-text">
          商品コードだけで決まる
        </text>
        <text x={320} y={270} textAnchor="middle" className="sc-big">
          主キーの一部だけで決まる ＝ 部分関数従属
        </text>
        <text x={320} y={300} textAnchor="middle" className="sc-small">
          数量は、受注番号と商品コードの両方で決まる（完全関数従属）
        </text>
      </g>

      {/* 第2正規形・第3正規形 */}
      <g className="sc-fade" style={{ ...at(20, 60), ...shown(beat >= 3) }}>
        <Table
          title="受注"
          w={86}
          cols={beat >= 5 ? [C('受注番号', true), C('受注日'), C('顧客コード')] : [C('受注番号', true), C('受注日'), C('顧客コード'), C('顧客名')]}
          rows={[beat >= 5 ? ['1001', '11/5', 'K1'] : ['1001', '11/5', 'K1', '山田商店']]}
          hot={beat === 4 ? [2, 3] : []}
        />
      </g>
      <g className="sc-fade" style={{ ...at(420, 60), ...shown(beat >= 3) }}>
        <Table
          title="商品"
          w={90}
          cols={[C('商品コード', true), C('商品名')]}
          rows={[
            ['P1', 'りんご'],
            ['P2', 'みかん'],
          ]}
        />
      </g>
      <g className="sc-fade" style={{ ...at(20, 190), ...shown(beat >= 3) }}>
        <Table
          title="受注明細"
          w={90}
          cols={[C('受注番号', true), C('商品コード', true), C('数量')]}
          rows={[
            ['1001', 'P1', '3'],
            ['1001', 'P2', '5'],
          ]}
        />
      </g>
      <g className="sc-fade" style={{ ...at(420, 190), ...shown(beat >= 5) }}>
        <Table title="顧客" w={90} cols={[C('顧客コード', true), C('顧客名')]} rows={[['K1', '山田商店']]} />
      </g>
      <g className="sc-fade" style={shown(beat === 4)}>
        <text x={330} y={300} textAnchor="middle" className="sc-big">
          受注番号 → 顧客コード → 顧客名
        </text>
        <text x={330} y={328} textAnchor="middle" className="sc-small">
          顧客名は、主キーではなく顧客コードで決まる（推移的関数従属）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={320} y={320} textAnchor="middle" className="sc-title sc-ok-text">
          第3正規形：顧客名を変えるときは「顧客」の1行だけ直せばよい
        </text>
      </g>
    </g>
  )
}

export const normalizeScene: Scene = {
  label: '受注の伝票を表にし、重なりをなくすように表を分けていく（正規化）',
  Stage,
  beats: [
    { say: '受注の伝票をそのまま表にすると、1行の「商品」の欄に、りんごとみかんの2つが入ってしまいます。これでは表の形が決まりません（非正規形）。' },
    { say: '商品ごとに1行にします（第1正規形）。すると、受注日や顧客名が、商品の数だけ何度も書かれてしまいます。' },
    { say: 'よく見ると、受注日・顧客は受注番号だけで、商品名は商品コードだけで決まります。主キーの一部だけで決まる列があるのが、重なりの原因です。' },
    { say: '受注番号だけで決まる列は「受注」へ、商品コードだけで決まる列は「商品」へ分けます。数量は「受注明細」に残ります（第2正規形）。' },
    { say: 'まだ「受注」に、顧客コードを通して決まる顧客名が残っています。受注番号 → 顧客コード → 顧客名 という、間接的な決まり方です。' },
    { say: '顧客名を「顧客」の表に分けて、第3正規形の完成です。どの情報も1か所にしかないので、直すときに食い違いが起きません。' },
  ],
}
