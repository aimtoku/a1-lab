import type { ReactNode } from 'react'
import type { Block as BlockSpec } from '../types'
import { Figure } from './Figure'

/** 本文のかたまり。text は用語を押せるようにして表示する関数 */
export function Block({ block, text, figNo }: { block: BlockSpec; text: (t: string) => ReactNode; figNo?: string }) {
  switch (block.kind) {
    case 'p':
      return <p>{text(block.text)}</p>
    case 'note':
      return (
        <p className="topic-note">
          <span className="note-label">補足</span>
          {text(block.text)}
        </p>
      )
    case 'list':
      return (
        <ul className="plain-list">
          {block.items.map((t, i) => (
            <li key={i}>{text(t)}</li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="topic-steps">
          {block.items.map((s, i) => (
            <li key={i}>
              <span className="step-title">{text(s.title)}</span>
              <span className="step-text">{text(s.text)}</span>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="table-scroll topic-table-wrap">
          <table className={`compare topic-table${block.head.length >= 3 ? ' wide' : ''}`}>
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) =>
                    j === 0 ? (
                      <th key={j} scope="row">
                        {text(c)}
                      </th>
                    ) : (
                      <td key={j}>{text(c)}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'formula':
      return (
        <div className="formula" role="group" aria-label="計算">
          {block.lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )
    case 'figure':
      return <Figure figure={block.figure} caption={text(block.caption)} number={figNo} />
  }
}
