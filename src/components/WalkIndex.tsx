import { AREAS, CHAPTERS, chapterNumber, WALKS, walkPath } from '../content'
import { Link } from '../router'

/** 図解の一覧 */
export function WalkIndex() {
  return (
    <div className="topic">
      <nav className="crumbs" aria-label="現在の位置">
        <Link to="/">トップ</Link>
        <span aria-hidden="true">›</span>
        <span>図解</span>
      </nav>
      <header className="topic-head">
        <p className="eyebrow">図解</p>
        <h1>図解の一覧</h1>
        <p className="lead">計算や処理の流れを、1ステップずつ図で確かめます。キーボードの ← → でも進められます。</p>
      </header>
      {AREAS.map((area) => {
        const chapters = CHAPTERS.filter((c) => c.area === area.id && WALKS.some((w) => w.chapter === c.id))
        if (chapters.length === 0) return null
        return (
          <section key={area.id} className="study-card" aria-labelledby={`walks-${area.id}`}>
            <h2 id={`walks-${area.id}`}>{area.title}</h2>
            {chapters.map((c) => (
              <div key={c.id} className="walk-group">
                <h3>
                  第{chapterNumber(c.id)}章 {c.title}
                </h3>
                <ul className="related-links">
                  {WALKS.filter((w) => w.chapter === c.id).map((w) => (
                    <li key={w.id}>
                      <Link to={walkPath(w.id)}>
                        <span className="related-name">{w.title}</span>
                        <span className="related-threat">
                          {w.lead}（{w.steps.length}ステップ）
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}
