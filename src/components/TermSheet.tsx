import { useEffect } from 'react'
import { chapterPath, findChapter, findWalk, walkPath } from '../content'
import { placesOf, TERM_BY_ID } from '../glossary/match'
import { Link } from '../router'

const MAX = 6

/** 文中の用語を押したときに、画面の下（PCでは隅）に出す説明。その用語が出てくる章や図解へ移動できる */
export function TermSheet({ termId, onClose, here }: { termId: string; onClose: () => void; here?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const term = TERM_BY_ID.get(termId)
  if (!term) return null
  const places = placesOf(termId).filter((p) => p.id !== here)
  const chapters = places.flatMap((p) => (p.kind === 'chapter' ? [p] : [])).slice(0, MAX)
  const walks = places.flatMap((p) => (p.kind === 'walk' ? [p] : [])).slice(0, MAX)

  return (
    <aside className="term-sheet right" aria-label={`用語：${term.name}`} aria-live="polite">
      <div className="term-sheet-head">
        <h2>{term.name}</h2>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="用語の説明を閉じる">
          ×
        </button>
      </div>
      <p>{term.description}</p>
      {chapters.length > 0 && (
        <>
          <h3>{here ? 'ほかの章' : '教科書'}</h3>
          <div className="chips">
            {chapters.map((p) => (
              <Link key={p.id} to={chapterPath(p.id, p.section)} className="chip other">
                {findChapter(p.id)?.title}
              </Link>
            ))}
          </div>
        </>
      )}
      {walks.length > 0 && (
        <>
          <h3>図解で見る</h3>
          <div className="chips">
            {walks.map((p) => (
              <Link key={p.id} to={walkPath(p.id, p.step)} className="chip k-normal">
                {findWalk(p.id)?.title}
              </Link>
            ))}
          </div>
        </>
      )}
      <Link to={`/terms#${term.id}`} className="ghost-button sheet-list">
        用語の一覧を開く
      </Link>
    </aside>
  )
}
