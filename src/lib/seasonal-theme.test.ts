import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_HALLOWEEN_VARIANT, isHalloween, resolveHalloweenVariant, subscribeLocalDate } from './seasonal-theme'

describe('Halloween calendar gate', () => {
  it('runs only on October 31 in the visitor local calendar', () => {
    expect(isHalloween(new Date(2026, 9, 30, 23, 59))).toBe(false)
    expect(isHalloween(new Date(2026, 9, 31))).toBe(true)
    expect(isHalloween(new Date(2026, 9, 31, 23, 59))).toBe(true)
    expect(isHalloween(new Date(2026, 10, 1))).toBe(false)
    expect(isHalloween(new Date(2027, 9, 31))).toBe(true)
  })
  it('supports a kill switch and deliberate preview', () => {
    expect(isHalloween(new Date(2026, 9, 31), 'off', true)).toBe(false)
    expect(isHalloween(new Date(2026, 9, 30), 'auto', true)).toBe(true)
    expect(isHalloween(new Date(2026, 9, 30), 'on')).toBe(true)
  })
  it('refreshes an open tab across midnight and cleans up its timer', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 31, 23, 59, 59))
    const callback = vi.fn()
    const unsubscribe = subscribeLocalDate(callback)
    try {
      vi.advanceTimersByTime(1100)
      expect(callback).toHaveBeenCalledOnce()
      expect(isHalloween(new Date())).toBe(false)
      unsubscribe()
      vi.advanceTimersByTime(24 * 60 * 60 * 1000)
      expect(callback).toHaveBeenCalledOnce()
    } finally { unsubscribe(); vi.useRealTimers() }
  })
  it('picks a preview treatment only where previews are allowed', () => {
    const oct30 = new Date(2026, 9, 30)
    const oct31 = new Date(2026, 9, 31)
    expect(resolveHalloweenVariant(oct30, 'auto', 'b', true)).toBe('b')
    expect(resolveHalloweenVariant(oct30, 'auto', 'c', true)).toBeNull()
    expect(resolveHalloweenVariant(oct30, 'auto', 'preview', true)).toBe(DEFAULT_HALLOWEEN_VARIANT)
    expect(resolveHalloweenVariant(oct30, 'auto', 'a', false)).toBeNull()
    expect(resolveHalloweenVariant(oct31, 'auto', 'a', false)).toBe(DEFAULT_HALLOWEEN_VARIANT)
    expect(resolveHalloweenVariant(oct31, 'auto', 'off', true)).toBeNull()
    expect(resolveHalloweenVariant(oct31, 'auto', 'bogus', true)).toBe(DEFAULT_HALLOWEEN_VARIANT)
    expect(resolveHalloweenVariant(oct30, 'off', 'a', true)).toBeNull()
  })
})
