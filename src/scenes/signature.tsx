import type { Scene } from './types'
import { Person, at, shown } from './parts'

/** 文書（紙） */
function Doc({ text, tampered = false }: { text: string; tampered?: boolean }) {
  return (
    <g>
      <path d="M -38 -34 H 26 L 38 -22 V 34 H -38 Z" className={tampered ? 'sc-doc-bad' : 'sc-doc'} />
      <text x={0} y={4} textAnchor="middle" className={tampered ? 'sc-small sc-ng-text' : 'sc-small'}>
        {text}
      </text>
      <line x1={-16} y1={14} x2={16} y2={14} className="sc-grid" />
      <line x1={-16} y1={22} x2={10} y2={22} className="sc-grid" />
    </g>
  )
}

/** ハッシュ値（指紋のような短い値） */
function Hash({ v, tone = 'sc-hot' }: { v: string; tone?: string }) {
  return (
    <g>
      <rect x={-44} y={-16} width={88} height={32} rx={8} className={tone} />
      <text x={0} y={5} textAnchor="middle" className="sc-mono" fontSize={14}>
        {v}
      </text>
    </g>
  )
}

function Key({ x, y, kind }: { x: number; y: number; kind: 'secret' | 'public' }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} className={kind === 'secret' ? 'sc-key-secret' : 'sc-key-public'} />
      <rect x={x + 9} y={y - 3} width={26} height={7} rx={2} className={kind === 'secret' ? 'sc-key-secret' : 'sc-key-public'} />
    </g>
  )
}

function Stage({ beat }: { beat: number }) {
  const sent = beat >= 3
  const bad = beat === 6
  return (
    <g>
      <Person x={60} y={40} label="送信者" />
      <Person x={580} y={40} label="受信者" />
      <line x1={320} y1={20} x2={320} y2={340} className="sc-line" strokeDasharray="6 6" />

      {/* 送信者の手元 */}
      <g className="sc-move" style={at(sent ? 400 : 90, 190)}>
        <Doc text={bad ? '9万円 払う' : '1万円 払う'} tampered={bad} />
      </g>
      <g className="sc-fade" style={shown(beat >= 1 && beat <= 2)}>
        <path d="M 130 190 H 166" className="sc-accent-stroke" />
        <g style={at(220, 190)}>
          <Hash v="a3f9" />
        </g>
        <text x={220} y={160} textAnchor="middle" className="sc-small">
          ハッシュ値（文書の指紋）
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 2)}>
        <path d="M 220 208 V 256" className="sc-accent-stroke" />
        <Key x={160} y={240} kind="secret" />
        <text x={110} y={338} textAnchor="middle" className="sc-small">
          秘密鍵（送信者だけ）で暗号化
        </text>
      </g>
      <g className="sc-move" style={{ ...at(sent ? 400 : 220, 290), ...shown(beat >= 2) }}>
        <circle r={26} className="sc-seal" />
        <text y={5} textAnchor="middle" className="sc-seal-text">
          署名
        </text>
      </g>

      {/* 受信者の確認 */}
      <g className="sc-fade" style={shown(beat >= 4)}>
        <path d="M 444 190 H 482" className="sc-accent-stroke" />
        <g style={at(530, 190)}>
          <Hash v={bad ? '7c21' : 'a3f9'} tone={bad ? 'sc-tag-ng' : 'sc-hot'} />
        </g>
        <text x={530} y={160} textAnchor="middle" className="sc-small">
          届いた文書から求める
        </text>
        <path d="M 430 290 H 470" className="sc-accent-stroke" />
        <g style={at(530, 290)}>
          <Hash v="a3f9" />
        </g>
        <text x={530} y={330} textAnchor="middle" className="sc-small">
          署名を公開鍵（だれでも）で戻す
        </text>
        <Key x={426} y={270} kind="public" />
      </g>
      <g className="sc-fade" style={shown(beat >= 5)}>
        <text x={530} y={248} textAnchor="middle" className={`sc-big ${bad ? 'sc-ng-text' : 'sc-ok-text'}`}>
          {bad ? '≠' : '＝'}
        </text>
      </g>
      <g className="sc-fade" style={shown(beat === 5)}>
        <text x={160} y={310} textAnchor="middle" className="sc-title sc-ok-text">
          一致 → 書き換えなし・本人が送った
        </text>
      </g>
      <g className="sc-fade" style={shown(bad)}>
        <text x={160} y={310} textAnchor="middle" className="sc-title sc-ng-text">
          途中で書き換えると、指紋が合わない
        </text>
      </g>
    </g>
  )
}

export const signatureScene: Scene = {
  label: '文書の指紋（ハッシュ値）を秘密鍵で封印して署名にし、受信者が公開鍵で開いて指紋を比べる',
  Stage,
  beats: [
    { say: '送信者が「1万円 払う」という文書を送ります。届いた文書が書き換えられていないこと、本当にその人が送ったことを、受信者が確かめられるようにします。' },
    { say: 'まず文書から、ハッシュ値という短い値を求めます。文書の「指紋」のようなもので、1文字でも変わると、まったく違う値になります。' },
    { say: '指紋を、送信者だけが持つ秘密鍵で暗号化します。これがデジタル署名です。秘密鍵がない人には、同じ署名は作れません。' },
    { say: '文書と署名をいっしょに送ります。文書そのものは暗号化していないので、中身は読めます。' },
    { say: '受信者は、届いた文書から自分で指紋を求めます。また、署名を送信者の公開鍵で戻して、送信者が求めた指紋を取り出します。' },
    { say: '2つの指紋が一致すれば、途中で書き換えられていない（完全性）、送信者の秘密鍵で作られた（本人が送った）と確かめられます。' },
    { say: 'もし途中で「9万円」に書き換えられたら、届いた文書の指紋が変わり、一致しません。書き換えにすぐ気づけます。' },
  ],
}
