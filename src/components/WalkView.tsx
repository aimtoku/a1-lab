import { useCallback, useEffect, useState } from 'react'
import { chapterPath, findChapter, WALKS, walkPath } from '../content'
import { Link } from '../router'
import type { Walk } from '../types'
import { Block } from './Block'
import { Figure } from './Figure'
import { TermSheet } from './TermSheet'
import { TermText } from './TermText'

function initialStep(walk: Walk): number {
  const n = Number(new URLSearchParams(window.location.search).get('step'))
  return Number.isInteger(n) && n >= 1 && n <= walk.steps.length ? n - 1 : 0
}

/** 図解：計算や処理の流れを、1ステップずつ図で再生する */
export function WalkView({ walk }: { walk: Walk }) {
  const [index, setIndex] = useState(() => initialStep(walk))
  const [term, setTerm] = useState<string | null>(null)
  const onTerm = useCallback((id: string) => setTerm((cur) => (cur === id ? null : id)), [])
  const close = useCallback(() => setTerm(null), [])
  const text = (t: string) => <TermText text={t} activeTerm={term} onTerm={onTerm} />
  const step = walk.steps[index]!
  const total = walk.steps.length
  const chapter = findChapter(walk.chapter)
  const others = WALKS.filter((w) => w.chapter === walk.chapter && w.id !== walk.id)

  // いまのステップをURLに反映する（そのまま共有できるように）
  useEffect(() => {
    window.history.replaceState(null, '', walkPath(walk.id, index + 1))
  }, [walk.id, index])

  const go = useCallback((i: number) => setIndex(Math.min(Math.max(i, 0), total - 1)), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  return (
    <div className={`topic walk${term ? ' has-sheet' : ''}`}>
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <Link to="/walk">図解</Link>
        <span aria-hidden="true">›</span>
        <span>{walk.title}</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">図解{chapter ? ` · ${chapter.title}` : ''}</p>
        <h1>{walk.title}</h1>
        <p className="lead">{text(walk.lead)}</p>
      </header>

      <ol className="walk-steps" aria-label="ステップ">
        {walk.steps.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              className={i === index ? 'walk-chip current' : i < index ? 'walk-chip done' : 'walk-chip'}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span className="walk-chip-no">{i + 1}</span>
              <span className="walk-chip-title">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="study-card walk-card" aria-live="polite" aria-labelledby="walk-step-title">
        <p className="walk-count">
          STEP {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
        <h2 id="walk-step-title">{step.title}</h2>
        <Figure figure={step.figure} caption={text(step.title)} legend="このステップで注目するところ" />
        <p className="walk-text">{text(step.text)}</p>
        {step.blocks?.map((b, i) => (
          <Block key={i} block={b} text={text} />
        ))}
        {step.point && (
          <p className="walk-point">
            <span className="walk-point-label">ポイント</span>
            {text(step.point)}
          </p>
        )}
        <div className="walk-nav">
          <button type="button" className="ghost-button" onClick={() => go(index - 1)} disabled={index === 0}>
            ← 前へ
          </button>
          {index < total - 1 ? (
            <button type="button" className="button-primary" onClick={() => go(index + 1)}>
              次へ →
            </button>
          ) : chapter ? (
            <Link to={chapterPath(chapter.id, 'quiz')} className="button-primary">
              確認問題へ →
            </Link>
          ) : null}
        </div>
      </section>

      <section className="study-card" aria-labelledby="walk-more">
        <h2 id="walk-more">あわせて読む</h2>
        <ul className="related-links">
          {chapter && (
            <li>
              <Link to={chapterPath(chapter.id)}>
                <span className="related-name">教科書：{chapter.title}</span>
                <span className="related-threat">{chapter.lead}</span>
              </Link>
            </li>
          )}
          {others.map((w) => (
            <li key={w.id}>
              <Link to={walkPath(w.id)}>
                <span className="related-name">図解：{w.title}</span>
                <span className="related-threat">{w.lead}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {term && <TermSheet termId={term} onClose={close} here={walk.id} />}
    </div>
  )
}
