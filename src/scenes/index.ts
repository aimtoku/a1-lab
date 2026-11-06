import type { Scene } from './types'
import { roundrobinScene } from './roundrobin'
import { pipelineScene } from './pipeline'
import { testcasesScene } from './testcases'
import { binsearchScene } from './binsearch'
import { bubbleScene } from './bubble'
import { mediaSizeScene } from './media'
import { adderScene } from './adder'
import { huffmanScene } from './huffman'
import { signatureScene } from './signature'
import { normalizeScene } from './normalize'
import { deadlockScene } from './deadlock'
import { recoveryScene } from './recovery'
import { subnetScene } from './subnet'
import { transferScene } from './transfer'
import { mrpScene } from './mrp'
import { reorderScene } from './reorder'
import { investmentScene } from './investment'
import { ppmScene } from './ppm'
import { incidentScene } from './incident'
import { evmScene } from './evm'
import { availabilityScene } from './availability'
import { bepScene } from './bep'
import { cacheScene } from './cache'
import { cpmScene } from './cpm'
import { pagingScene } from './paging'
import { probScene } from './prob'
import { radixScene } from './radix'
import { stackScene } from './stack'

/** 動く図解（紙芝居）。図解（Walk）の ID ごと */
export const SCENES: Readonly<Record<string, Scene>> = {
  radix: radixScene,
  prob: probScene,
  stack: stackScene,
  cache: cacheScene,
  availability: availabilityScene,
  paging: pagingScene,
  cpm: cpmScene,
  bep: bepScene,
  roundrobin: roundrobinScene,
  pipeline: pipelineScene,
  testcases: testcasesScene,
  binsearch: binsearchScene,
  bubble: bubbleScene,
  'media-size': mediaSizeScene,
  adder: adderScene,
  huffman: huffmanScene,
  signature: signatureScene,
  normalize: normalizeScene,
  deadlock: deadlockScene,
  recovery: recoveryScene,
  subnet: subnetScene,
  transfer: transferScene,
  mrp: mrpScene,
  reorder: reorderScene,
  investment: investmentScene,
  ppm: ppmScene,
  incident: incidentScene,
  evm: evmScene,
}

export type { Scene } from './types'
export { ScenePlayer } from './ScenePlayer'
