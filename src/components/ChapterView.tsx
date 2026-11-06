import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AREAS, CHAPTERS, chapterNumber, chapterPath, findWalk, walkPath, walksOf } from '../content'
import { Link } from '../router'
import type { Block as BlockSpec, Chapter } from '../types'
import { Block } from './Block'
import { Quiz } from './Quiz'
import { TermSheet } from './TermSheet'
import { TermText } from './TermText'

/** 教科書の1章：節を順に積み重ねて読み、最後に確認問題を解く */
export function ChapterView({ chapter }: { chapter: Chapter }) {
  const [term, setTerm] = useState<string | null>(null)
  const onTerm = useCallback((id: string) => setTerm((cur) => (cur === id ? null : id)), [])
  const close = useCallback(() => setTerm(null), [])
  const text = (t: string) => <TermText text={t} activeTerm={term} onTerm={onTerm} />
  const no = chapterNumber(chapter.id)
  const area = AREAS.find((a) => a.id === chapter.area)
  const prev = CHAPTERS[no - 2]
  const next = CHAPTERS[no]
  const walks = walksOf(chapter.id)

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [chapter.id])

  let figNo = 0
  const block = (b: BlockSpec, i: number): ReactNode => {
    if (b.kind === 'figure') figNo += 1
    return <Block key={i} block={b} text={text} figNo={b.kind === 'figure' ? `${no}-${figNo}` : undefined} />
  }

  return (
    <div className={`topic book${term ? ' has-sheet' : ''}`}>
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <span>
          {area?.title} · 第{no}章
        </span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">
          {area?.title} · 第{no}章
        </p>
        <h1>{chapter.title}</h1>
        <p className="lead">{text(chapter.lead)}</p>
      </header>

      <div className="topic-layout">
        <nav className="topic-toc" aria-labelledby="toc-title">
          <h2 id="toc-title">この章</h2>
          <ol>
            {chapter.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  {no}.{i + 1} {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#points">試験のポイント</a>
            </li>
            <li>
              <a href="#quiz">確認問題</a>
            </li>
          </ol>
          {walks.length > 0 && (
            <>
              <h2>この章の図解</h2>
              <ul>
                {walks.map((w) => (
                  <li key={w.id}>
                    <Link to={walkPath(w.id)}>{w.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="study topic-main">
          {chapter.sections.map((s, i) => {
            const walk = s.walk ? findWalk(s.walk.id) : undefined
            return (
              <section key={s.id} id={s.id} className="study-card topic-section book-section" aria-labelledby={`${s.id}-title`}>
                <h2 id={`${s.id}-title`}>
                  <span className="section-no">
                    {no}.{i + 1}
                  </span>
                  {s.title}
                </h2>
                {s.blocks.map(block)}
                {walk && (
                  <p className="book-see">
                    <Link to={walkPath(walk.id, s.walk?.step)}>
                      図解で確かめる：{walk.title}
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </p>
                )}
              </section>
            )
          })}

          <section id="points" className="study-card" aria-labelledby="points-title">
            <h2 id="points-title">試験のポイント</h2>
            <ul className="goals">
              {chapter.points.map((pt, i) => (
                <li key={i}>{text(pt)}</li>
              ))}
            </ul>
          </section>

          <section id="quiz" className="study-card" aria-labelledby="quiz-title">
            <Quiz questions={chapter.quiz} text={text} />
          </section>

          <nav className="book-pager" aria-label="前後の章">
            {prev ? (
              <Link to={chapterPath(prev.id)} className="pager-prev">
                <span className="pager-dir">← 前の章</span>
                <span>{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={chapterPath(next.id)} className="pager-next">
                <span className="pager-dir">次の章 →</span>
                <span>{next.title}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {term && <TermSheet termId={term} onClose={close} here={chapter.id} />}
    </div>
  )
}
