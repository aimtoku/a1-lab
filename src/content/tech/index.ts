import type { Chapter, Walk } from '../../types'
import { algo, binsearch, bubble, stack } from './algo'
import { adder, basics, huffman, radix } from './basics'
import { cache, computer, pipeline } from './computer'
import { db, deadlock, normalize, recovery } from './db'
import { dev, devmgmt, testcases } from './dev'
import { media, mediaSize } from './media'
import { network, subnet, transfer } from './network'
import { security, signature } from './security'
import { paging, roundrobin, software } from './software'
import { availability, system } from './system'

/** テクノロジ系の章（読む順） */
export const TECH_CHAPTERS: readonly Chapter[] = [basics, algo, computer, system, software, media, db, network, security, dev, devmgmt]

export const TECH_WALKS: readonly Walk[] = [
  radix,
  adder,
  huffman,
  stack,
  binsearch,
  bubble,
  pipeline,
  cache,
  availability,
  roundrobin,
  paging,
  mediaSize,
  normalize,
  deadlock,
  recovery,
  subnet,
  transfer,
  signature,
  testcases,
]
