import { useEffect } from 'react'
import { findChapter, findWalk } from './content'
import { ChapterView } from './components/ChapterView'
import { Home } from './components/Home'
import { TermsView } from './components/TermsView'
import { WalkIndex } from './components/WalkIndex'
import { WalkView } from './components/WalkView'
import { Link, usePathname } from './router'

const SITE_NAME = '科目A-1 ラボ'
const REPOSITORY_URL = 'https://github.com/aimtoku/a1-lab'

export function App() {
  const pathname = usePathname()
  const id = pathname.replace(/^\/+|\/+$/g, '')
  const chapterId = id.match(/^book\/([a-z0-9-]+)$/)?.[1]
  const chapter = chapterId ? findChapter(chapterId) : undefined
  const walkId = id.match(/^walk\/([a-z0-9-]+)$/)?.[1]
  const walk = walkId ? findWalk(walkId) : undefined
  const isWalks = id === 'walk'
  const isTerms = id === 'terms'
  const notFound = id !== '' && !chapter && !walk && !isWalks && !isTerms

  useEffect(() => {
    document.title = chapter
      ? `${chapter.title} | ${SITE_NAME}`
      : walk
        ? `${walk.title}（図解） | ${SITE_NAME}`
        : isWalks
          ? `図解の一覧 | ${SITE_NAME}`
          : isTerms
            ? `用語の一覧 | ${SITE_NAME}`
            : `${SITE_NAME}：高度試験の科目A-1を図と教科書で`
  }, [chapter, walk, isWalks, isTerms])

  return (
    <div className="site">
      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-mark">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
              <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
              <path d="M10.5 7h6.5v6.5" />
            </svg>
            {SITE_NAME}
          </Link>
          <nav className="site-nav" aria-label="サイト内">
            <Link to="/" aria-current={id === '' || id.startsWith('book') ? 'page' : undefined}>
              教科書
            </Link>
            <Link to="/walk" aria-current={id.startsWith('walk') ? 'page' : undefined}>
              図解
            </Link>
            <Link to="/terms" aria-current={isTerms ? 'page' : undefined}>
              用語
            </Link>
          </nav>
        </div>
      </header>

      <main className="wrap">
        {chapter ? (
          <ChapterView key={chapter.id} chapter={chapter} />
        ) : walk ? (
          <WalkView key={walk.id} walk={walk} />
        ) : isWalks ? (
          <WalkIndex />
        ) : isTerms ? (
          <TermsView />
        ) : notFound ? (
          <div className="not-found">
            <h1>ページが見つかりません</h1>
            <p>URLが間違っているか、ページが移動した可能性があります。</p>
            <Link to="/">トップページへ戻る</Link>
          </div>
        ) : (
          <Home />
        )}
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            情報処理推進機構（IPA）とは関係のない、個人の学習用のサイトです。試験の制度や出題範囲は、IPAの試験要綱・シラバスで確かめてください。図中のIPアドレスやドメインは、説明用に予約されたものです。
          </p>
          <ul className="footer-links">
            <li>
              <a href={REPOSITORY_URL} rel="noopener noreferrer" target="_blank">
                ソースコード（GitHub）
              </a>
            </li>
            <li>
              <a href={`${REPOSITORY_URL}/security/policy`} rel="noopener noreferrer" target="_blank">
                脆弱性の報告
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
