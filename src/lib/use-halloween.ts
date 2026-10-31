import { useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { resolveHalloweenVariant, subscribeLocalDate, type HalloweenVariant } from './seasonal-theme'

export const halloweenPreviewAllowed = () =>
  import.meta.env.DEV || import.meta.env.VITE_TELEMETRY_ENVIRONMENT === 'staging'

export function useHalloweenVariant(): HalloweenVariant | null {
  const { search } = useLocation()
  const param = new URLSearchParams(search).get('halloween')
  return useSyncExternalStore(subscribeLocalDate,
    () => resolveHalloweenVariant(new Date(), import.meta.env.VITE_HALLOWEEN_MODE, param, halloweenPreviewAllowed()),
    () => null)
}

export function useHalloween() {
  return useHalloweenVariant() !== null
}
