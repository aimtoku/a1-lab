import { describe, expect, it } from 'vitest'
import { WALKS } from '../content'
import { SCENES } from './index'
import { beatDuration } from './types'

describe('動く図解（紙芝居）', () => {
  const ids = Object.keys(SCENES)

  it('すべての図解（Walk）にある', () => {
    for (const w of WALKS) expect(ids).toContain(w.id)
  })

  it.each(ids)('%s：図解（Walk）に対応し、場面が3つ以上ある', (id) => {
    expect(WALKS.some((w) => w.id === id)).toBe(true)
    const scene = SCENES[id]!
    expect(scene.beats.length).toBeGreaterThanOrEqual(3)
    expect(scene.label.length).toBeGreaterThan(0)
    for (const b of scene.beats) {
      expect(b.say).toMatch(/。$/)
      expect([...b.say].length).toBeLessThanOrEqual(130)
      expect(beatDuration(b)).toBeGreaterThanOrEqual(4500)
    }
  })
})
