import { useEffect, useMemo, useState } from 'react'
import { chapterPath, findChapter, findWalk, walkPath } from '../content'
import { placesOf } from '../glossary/match'
import { TERMS } from '../glossary/terms'
import { Link } from '../router'

/** 用語の一覧。名前と説明で絞り込める */
export function TermsView() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = useMemo(() => (q ? TERMS.filter((t) => [t.name, ...t.aliases, t.description].some((s) => s.toLowerCase().includes(q))) : TERMS), [q])

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div className="topic">
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <span>用語</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">用語</p>
        <h1>用語の一覧</h1>
        <p className="lead">教科書と図解に出てくる用語です（全{TERMS.length}語）。本文の中の用語を押しても、説明が開きます。</p>
      </header>
      <label className="terms-filter">
        <span>絞り込み</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例：稼働率、ハッシュ、損益分岐点" />
      </label>
      <p className="terms-count" aria-live="polite">
        {shown.length}語
      </p>
      <dl className="terms-list">
        {shown.map((t) => {
          const places = placesOf(t.id)
          return (
            <div key={t.id} id={t.id} className="terms-item">
              <dt>{t.name}</dt>
              <dd>
                <p>{t.description}</p>
                {places.length > 0 && (
                  <div className="chips">
                    {places.slice(0, 6).map((p) =>
                      p.kind === 'chapter' ? (
                        <Link key={`c${p.id}`} to={chapterPath(p.id, p.section)} className="chip other">
                          {findChapter(p.id)?.title}
                        </Link>
                      ) : (
                        <Link key={`w${p.id}`} to={walkPath(p.id, p.step)} className="chip k-normal">
                          図解：{findWalk(p.id)?.title}
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
