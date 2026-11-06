import type { AreaId, Chapter, Walk } from '../types'
import { TECH_CHAPTERS, TECH_WALKS } from './tech'
import { MGMT_CHAPTERS, MGMT_WALKS } from './mgmt'
import { PLAIN } from './plain'
import { STRATEGY_CHAPTERS, STRATEGY_WALKS } from './strategy'

export const AREAS: readonly { id: AreaId; title: string; lead: string }[] = [
  {
    id: 'tech',
    title: 'テクノロジ系',
    lead: '基礎理論、アルゴリズム、コンピュータ、データベース、ネットワーク、セキュリティ、システム開発。出題の約6割を占めます。',
  },
  {
    id: 'mgmt',
    title: 'マネジメント系',
    lead: 'プロジェクトマネジメント、サービスマネジメント、システム監査。',
  },
  {
    id: 'strategy',
    title: 'ストラテジ系',
    lead: 'システム戦略、経営戦略、企業会計、法務。',
  },
]

/** 読む順番どおりに並べる */
export const CHAPTERS: readonly Chapter[] = [...TECH_CHAPTERS, ...MGMT_CHAPTERS, ...STRATEGY_CHAPTERS]

/** 図解。初めて学ぶ人向けの「図の見かた」と「ひとことで」（plain.ts）を付ける */
export const WALKS: readonly Walk[] = [...TECH_WALKS, ...MGMT_WALKS, ...STRATEGY_WALKS].map((w) => {
  const plain = PLAIN[w.id]
  return plain ? { ...w, howto: plain.howto, steps: w.steps.map((s, i) => ({ ...s, plain: plain.plain[i] })) } : w
})

export const chapterPath = (id: string, section?: string) => `/book/${id}${section ? `#${section}` : ''}`
export const walkPath = (id: string, step?: number) => `/walk/${id}${step && step > 1 ? `?step=${step}` : ''}`

export function findChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

export function findWalk(id: string): Walk | undefined {
  return WALKS.find((w) => w.id === id)
}

/** 章の番号（1から） */
export function chapterNumber(id: string): number {
  return CHAPTERS.findIndex((c) => c.id === id) + 1
}

/** 章に関係する図解 */
export function walksOf(chapterId: string): Walk[] {
  return WALKS.filter((w) => w.chapter === chapterId)
}

/** 選択肢の記号（試験と同じ ア・イ・ウ・エ） */
export const CHOICE_MARKS = ['ア', 'イ', 'ウ', 'エ'] as const
