import type { Chapter, Walk } from '../../types'
import { bep, corporate, mrp, reorder, techbiz } from './business'
import { law } from './law'
import { investment, mgmtstrategy, ppm, sysstrategy } from './strategy'

/** ストラテジ系の章（読む順） */
export const STRATEGY_CHAPTERS: readonly Chapter[] = [sysstrategy, mgmtstrategy, techbiz, corporate, law]

export const STRATEGY_WALKS: readonly Walk[] = [investment, ppm, mrp, reorder, bep]
