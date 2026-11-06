import type { Scene } from './types'
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
}

export type { Scene } from './types'
export { ScenePlayer } from './ScenePlayer'
