import type { ComponentType } from 'react'

/**
 * 動く図解（紙芝居）。身近なものの絵で場面を描き、1つの動きごとに短い説明（せりふ）を出す。
 * 場面（Beat）を進めると、絵の中のものが次の位置・状態へなめらかに動く。
 */
export interface Beat {
  /** 初めて学ぶ人向けの短い説明（1〜2文） */
  say: string
  /** 計算の式など、せりふの下に添えるもの */
  formula?: string
}

export interface Scene {
  beats: readonly Beat[]
  /** 場面の番号（0から）を受け取って、絵を描く。viewBox は 0 0 640 360 */
  Stage: ComponentType<{ beat: number }>
  /** 絵の説明（読み上げ用） */
  label: string
}

/** 場面を表示しておく時間（ミリ秒）。せりふが長いほど長くする */
export function beatDuration(b: Beat): number {
  const chars = [...b.say].length + (b.formula ? [...b.formula].length * 0.6 : 0)
  return Math.min(12000, Math.max(4500, 2500 + chars * 95))
}
