import { useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { resolveHalloweenVariant, subscribeLocalDate, type HalloweenVariant } from './seasonal-theme'

export const halloweenPreviewAllowed = () =>
  import.meta.env.DEV || import.meta.env.VITE_TELEMETRY_ENVIRONMENT === 'staging'

function useAvailableHalloweenVariant(): HalloweenVariant | null {
  const { search } = useLocation()
  const param = new URLSearchParams(search).get('halloween')
  return useSyncExternalStore(subscribeLocalDate,
    () => resolveHalloweenVariant(new Date(), import.meta.env.VITE_HALLOWEEN_MODE, param, halloweenPreviewAllowed()),
    () => null)
}

const PREFERENCE_KEY = 'mlvscan:halloween-effects'
const PREFERENCE_EVENT = 'mlvscan:halloween-effects-change'
let memoryEnabled = true

function getEnabled(): boolean {
  try { return localStorage.getItem(PREFERENCE_KEY) !== 'off' } catch { return memoryEnabled }
}

function subscribePreference(callback: () => void) {
  window.addEventListener(PREFERENCE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function useHalloweenSettings() {
  const variant = useAvailableHalloweenVariant()
  const enabled = useSyncExternalStore(subscribePreference, getEnabled, () => true)
  const toggle = () => {
    memoryEnabled = !getEnabled()
    try { localStorage.setItem(PREFERENCE_KEY, memoryEnabled ? 'on' : 'off') } catch { /* Keep the choice for this tab. */ }
    window.dispatchEvent(new Event(PREFERENCE_EVENT))
  }
  return { available: variant !== null, enabled, toggle, variant: enabled ? variant : null }
}

export function useHalloweenVariant(): HalloweenVariant | null {
  return useHalloweenSettings().variant
}
