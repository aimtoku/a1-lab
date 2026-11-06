import type { DeviceType } from '../types'

/** 機器のイラストの位置。x, y は機器の床面の手前の角（等角投影） */
export interface NodeSpec {
  x: number
  y: number
  type: DeviceType
  name: string
  sub: string
}

export type Point = readonly [number, number]

/** 線をつなぐ位置の高さ（床面からの高さ） */
export const ANCHOR_HEIGHT: Record<DeviceType, number> = {
  server: 18,
  pc: 13,
  laptop: 8,
  switch: 5,
  fw: 12,
  ap: 3,
  cloud: 0,
  team: 10,
}
