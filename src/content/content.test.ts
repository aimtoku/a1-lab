import { describe, expect, it } from 'vitest'
import { blockText, chapterTerms, placesOf } from '../glossary/match'
import { TERMS } from '../glossary/terms'
import type { Figure } from '../types'
import { AREAS, CHAPTERS, findWalk, WALKS } from './index'

/** 図の部品の参照（IDの重複、存在しない部品への参照）を確かめる */
function check(fig: Figure, where: string) {
  if (fig.kind === 'seq') {
    const ids = new Set(fig.actors.map((a) => a.id))
    expect(ids.size, `${where}：登場人物のIDが重複`).toBe(fig.actors.length)
    expect(fig.messages.length, where).toBeGreaterThan(0)
    for (const m of fig.messages) {
      expect(ids.has(m.from), `${where}：${m.from}`).toBe(true)
      expect(ids.has(m.to), `${where}：${m.to}`).toBe(true)
    }
  } else if (fig.kind === 'graph') {
    const ids = new Set(fig.nodes.map((n) => n.id))
    expect(ids.size, `${where}：節点のIDが重複`).toBe(fig.nodes.length)
    const cells = new Set(fig.nodes.map((n) => `${n.x},${n.y}`))
    expect(cells.size, `${where}：同じ位置に節点が重なっている`).toBe(fig.nodes.length)
    for (const n of fig.nodes) expect(n.x >= 0 && n.x < fig.cols && n.y >= 0 && n.y < fig.rows, `${where}：${n.id} が図の外`).toBe(true)
    for (const l of fig.links) {
      expect(ids.has(l.from), `${where}：${l.from}`).toBe(true)
      expect(ids.has(l.to), `${where}：${l.to}`).toBe(true)
    }
  } else if (fig.kind === 'cells') {
    expect(fig.rows.length, where).toBeGreaterThan(0)
    for (const r of fig.rows) expect(r.cells.length, where).toBeGreaterThan(0)
  } else if (fig.kind === 'xy') {
    for (const s of fig.series) {
      expect(s.points.length, `${where}：${s.label}`).toBeGreaterThan(1)
      for (const [x, y] of s.points) expect(x >= 0 && x <= fig.xMax && y >= 0 && y <= fig.yMax, `${where}：${s.label} (${x}, ${y}) がグラフの外`).toBe(true)
    }
    for (const mk of fig.marks ?? []) expect(mk.x <= fig.xMax && mk.y <= fig.yMax, `${where}：${mk.label}`).toBe(true)
  } else {
    for (const r of fig.rows)
      for (const b of r.bars) expect(b.start >= 0 && b.start + b.len <= fig.end + 1e-9, `${where}：${r.label} のバーが範囲の外`).toBe(true)
  }
}

describe('教科書の章', () => {
  it('IDが重ならず、どの分野にも章がある', () => {
    const ids = CHAPTERS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of AREAS)
      expect(
        CHAPTERS.some((c) => c.area === a.id),
        a.id,
      ).toBe(true)
  })

  for (const c of CHAPTERS) {
    describe(c.title, () => {
      it('節が4つ以上あり、IDが重ならない', () => {
        expect(c.sections.length).toBeGreaterThanOrEqual(4)
        const ids = c.sections.map((s) => s.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/)
      })

      it('図が2枚以上あり、図の部品の参照が正しい', () => {
        const figs = c.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'figure' ? [b] : [])))
        expect(figs.length).toBeGreaterThanOrEqual(2)
        c.sections.forEach((s) =>
          s.blocks.forEach((b, i) => {
            if (b.kind === 'figure') {
              expect(b.caption.trim()).not.toBe('')
              check(b.figure, `${c.id}/${s.id}/${i}`)
            }
          }),
        )
      })

      it('本文と表に空の文がなく、表の行は見出しと同じ列の数', () => {
        for (const s of c.sections) {
          for (const b of s.blocks) {
            for (const t of blockText(b)) expect(t.trim(), `${c.id}/${s.id}`).not.toBe('')
            if (b.kind === 'table') for (const r of b.rows) expect(r.length, `${c.id}/${s.id}：${r[0]}`).toBe(b.head.length)
          }
        }
      })

      it('図解へのリンクは、この章の図解の実在するステップを指す', () => {
        for (const s of c.sections) {
          if (!s.walk) continue
          const w = findWalk(s.walk.id)
          expect(w, `${c.id}/${s.id}：${s.walk.id}`).toBeDefined()
          expect(w!.chapter, `${c.id}/${s.id}`).toBe(c.id)
          expect(s.walk.step ?? 1, `${c.id}/${s.id}`).toBeLessThanOrEqual(w!.steps.length)
        }
      })

      it('試験のポイントと、確認問題（4問以上）がある', () => {
        expect(c.points.length).toBeGreaterThanOrEqual(3)
        expect(c.quiz.length).toBeGreaterThanOrEqual(4)
        for (const q of c.quiz) {
          expect(new Set(q.choices).size, q.question).toBe(4)
          expect(q.explanation.trim(), q.question).not.toBe('')
        }
      })

      it('用語が8つ以上出てくる', () => {
        expect(chapterTerms(c.id).length).toBeGreaterThanOrEqual(8)
      })
    })
  }

  it('4択の正解が、どれか1つの記号に偏っていない', () => {
    const counts = [0, 0, 0, 0]
    for (const c of CHAPTERS) for (const q of c.quiz) counts[q.answer]! += 1
    const total = counts.reduce((a, b) => a + b, 0)
    for (const n of counts) expect(n / total).toBeLessThan(0.4)
    for (const n of counts) expect(n / total).toBeGreaterThan(0.15)
  })
})

describe('図解', () => {
  it('IDが重ならず、関係する章が実在する', () => {
    const ids = WALKS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const w of WALKS)
      expect(
        CHAPTERS.some((c) => c.id === w.chapter),
        w.id,
      ).toBe(true)
  })

  for (const w of WALKS) {
    it(`${w.title}：ステップが3つ以上あり、図の参照が正しい`, () => {
      expect(w.steps.length).toBeGreaterThanOrEqual(3)
      w.steps.forEach((s, i) => {
        expect(s.text.trim(), `${w.id} #${i + 1}`).not.toBe('')
        check(s.figure, `${w.id} #${i + 1}`)
      })
    })

    it(`${w.title}：どこかの章の節から開ける`, () => {
      const linked = CHAPTERS.some((c) => c.sections.some((s) => s.walk?.id === w.id))
      expect(linked, w.id).toBe(true)
    })
  }
})

describe('用語', () => {
  it('IDが重ならない', () => {
    const ids = TERMS.map((t) => t.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('同じ別名が、2つの用語に登録されていない', () => {
    const aliases = TERMS.flatMap((t) => t.aliases)
    expect(aliases.filter((a, i) => aliases.indexOf(a) !== i)).toEqual([])
  })

  it('どの用語も、教科書か図解のどこかに出てくる', () => {
    expect(TERMS.filter((t) => placesOf(t.id).length === 0).map((t) => t.id)).toEqual([])
  })

  it('説明が空でない', () => {
    for (const t of TERMS) expect(t.description.trim(), t.id).not.toBe('')
  })
})
