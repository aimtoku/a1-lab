import { MGMT_TERMS } from './mgmt'
import { STRATEGY_TERMS } from './strategy'
import { TECH_TERMS } from './tech'
import type { Term } from './types'

/** 用語集（分野ごとのファイルにまとめて書く） */
export const TERMS: readonly Term[] = [...TECH_TERMS, ...MGMT_TERMS, ...STRATEGY_TERMS]
