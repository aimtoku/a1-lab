import { AREAS, CHAPTERS, chapterNumber, chapterPath, WALKS, walkPath } from '../content'
import { TERMS } from '../glossary/terms'
import { Link } from '../router'

export function Home() {
  const first = CHAPTERS[0]
  return (
    <>
      <section className="hero">
        <p className="eyebrow">情報処理技術者試験 · 高度試験・情報処理安全確保支援士試験 共通</p>
        <h1>科目A-1を、図と教科書で</h1>
        <p className="lead">
          高度試験の科目A-1（旧 午前Ⅰ）の範囲を、テクノロジ・マネジメント・ストラテジの{CHAPTERS.length}
          章にまとめました。計算や処理の流れは、図解で1ステップずつ確かめられます。各章の最後に、4択の確認問題があります。
        </p>
        <div className="hero-actions">
          {first && (
            <Link to={chapterPath(first.id)} className="button-primary">
              第1章から読む
            </Link>
          )}
          <Link to="/walk" className="ghost-button">
            図解の一覧（{WALKS.length}本）
          </Link>
          <Link to="/terms" className="ghost-button">
            用語の一覧（{TERMS.length}語）
          </Link>
        </div>
      </section>

      <section className="howto" aria-labelledby="howto-title">
        <h2 id="howto-title">使いかた</h2>
        <ol>
          <li>
            <strong>教科書を読む</strong>
            <span>節ごとに短い本文と図があります。図の黄色の印は、その節で新しく加わったものです。</span>
          </li>
          <li>
            <strong>図解で確かめる</strong>
            <span>進数の変換やクリティカルパスなど、手順のある計算を1ステップずつ再生します。</span>
          </li>
          <li>
            <strong>確認問題を解く</strong>
            <span>各章の最後の4択で確かめます。文中の用語を押すと、説明が開きます。</span>
          </li>
        </ol>
      </section>

      {AREAS.map((area) => (
        <section key={area.id} aria-labelledby={`area-${area.id}`}>
          <h2 id={`area-${area.id}`} className="section-title">
            {area.title}
            <span className="section-note">{area.lead}</span>
          </h2>
          <ol className="cards chapters">
            {CHAPTERS.filter((c) => c.area === area.id).map((c) => {
              const walks = WALKS.filter((w) => w.chapter === c.id)
              return (
                <li key={c.id} className="chapter-item">
                  <Link to={chapterPath(c.id)} className="card">
                    <span className="card-threat">第{chapterNumber(c.id)}章</span>
                    <span className="card-name">{c.title}</span>
                    <span className="card-text">{c.lead}</span>
                    <span className="card-meta">{c.sections.map((s) => s.title).join(' · ')}</span>
                  </Link>
                  {walks.length > 0 && (
                    <ul className="card-walks" aria-label={`${c.title}の図解`}>
                      {walks.map((w) => (
                        <li key={w.id}>
                          <Link to={walkPath(w.id)}>図解：{w.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </>
  )
}
