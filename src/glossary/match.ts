import { CHAPTERS, WALKS } from '../content'
import type { Block } from '../types'
import { TERMS } from './terms'
import type { Term } from './types'

export const TERM_BY_ID: ReadonlyMap<string, Term> = new Map(TERMS.map((t) => [t.id, t]))

const ALIAS_TO_TERM = new Map<string, string>()
for (const term of TERMS) for (const alias of term.aliases) ALIAS_TO_TERM.set(alias, term.id)

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * すべての別名をまとめた正規表現。長い別名を先に並べて、同じ位置なら長いほうを優先する。
 * 英数字で始まる別名（CPU、RAM など）は、英数字の途中にあるときには一致させない。
 */
const TERM_PATTERN = new RegExp(
  [...ALIAS_TO_TERM.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => (/^[A-Za-z0-9_]/.test(alias) ? `(?<![A-Za-z0-9_])${escapeRegExp(alias)}(?![A-Za-z0-9_])` : escapeRegExp(alias)))
    .join('|'),
  'g',
)

export type Segment = string | { termId: string; text: string }

/** 文章を、用語の部分とそれ以外に分ける */
export function splitTerms(text: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const match of text.matchAll(TERM_PATTERN)) {
    const termId = ALIAS_TO_TERM.get(match[0])
    if (!termId || match.index === undefined) continue
    if (match.index > last) segments.push(text.slice(last, match.index))
    segments.push({ termId, text: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push(text.slice(last))
  return segments
}

/** 文章に出てくる用語のID（出てくる順、重複なし） */
export function termIdsIn(text: string): string[] {
  const ids: string[] = []
  for (const seg of splitTerms(text)) if (typeof seg !== 'string' && !ids.includes(seg.termId)) ids.push(seg.termId)
  return ids
}

/** 本文のかたまりに含まれる文章 */
export function blockText(block: Block): string[] {
  switch (block.kind) {
    case 'p':
    case 'note':
      return [block.text]
    case 'list':
      return [...block.items]
    case 'steps':
      return block.items.flatMap((i) => [i.title, i.text])
    case 'table':
      return [...block.head, ...block.rows.flat()]
    case 'formula':
      return [...block.lines]
    case 'figure':
      return [block.caption]
  }
}

/** 用語が出てくる場所 */
export type Place = { kind: 'chapter'; id: string; section: string } | { kind: 'walk'; id: string; step: number }

function buildIndex(): Map<string, Place[]> {
  const index = new Map<string, Place[]>()
  const add = (text: string, place: Place) => {
    for (const id of termIdsIn(text)) {
      const list = index.get(id) ?? []
      const same = list.some((p) => p.kind === place.kind && p.id === place.id)
      if (!same) list.push(place)
      index.set(id, list)
    }
  }
  for (const c of CHAPTERS) {
    for (const s of c.sections) add([s.title, ...s.blocks.flatMap(blockText)].join('\n'), { kind: 'chapter', id: c.id, section: s.id })
  }
  for (const w of WALKS) {
    w.steps.forEach((s, i) => add([s.title, s.text, s.point ?? '', ...(s.blocks ?? []).flatMap(blockText)].join('\n'), { kind: 'walk', id: w.id, step: i + 1 }))
  }
  return index
}

const INDEX = buildIndex()

/** 用語が出てくる章と図解（章・図解ごとに最初の1か所） */
export function placesOf(termId: string): readonly Place[] {
  return INDEX.get(termId) ?? []
}

/** 章に出てくる用語 */
export function chapterTerms(chapterId: string): string[] {
  return [...INDEX.entries()].filter(([, places]) => places.some((p) => p.kind === 'chapter' && p.id === chapterId)).map(([id]) => id)
}
