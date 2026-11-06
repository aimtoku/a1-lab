import type { Chapter, Walk } from '../../types'
import { cpm, evm, pm } from './pm'
import { audit, incident, sm } from './service'

/** マネジメント系の章（読む順） */
export const MGMT_CHAPTERS: readonly Chapter[] = [pm, sm, audit]

export const MGMT_WALKS: readonly Walk[] = [cpm, evm, incident]
