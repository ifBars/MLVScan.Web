import { describe, expect, it } from 'vitest'
import { halloweenGutter, halloweenSpriteCount } from './halloween-scene'

describe('Halloween scene layout', () => {
  it('keeps sprites in side margins clear of a ~980px centre column on desktop', () => {
    expect(halloweenGutter(1440)).toBeCloseTo((1440 - 892.8) / 2)
    expect(halloweenGutter(1920)).toBe((1920 - 980) / 2)
  })

  it('drops sprites where the margins are too narrow, including phones', () => {
    expect(halloweenGutter(390)).toBe(0)
    expect(halloweenSpriteCount(390, 844)).toBe(0)
  })

  it('scales sprite count with margin area and caps it', () => {
    expect(halloweenSpriteCount(1440, 900)).toBeGreaterThanOrEqual(4)
    expect(halloweenSpriteCount(1440, 900)).toBeLessThanOrEqual(18)
    expect(halloweenSpriteCount(3840, 2160)).toBe(18)
  })
})
