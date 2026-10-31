/** Visitor-local calendar day; no timezone, identity or preference is transmitted. */
export function isHalloween(date: Date, mode = 'auto', preview = false): boolean {
  if (mode === 'off') return false
  return mode === 'on' || preview || (date.getMonth() === 9 && date.getDate() === 31)
}

export function subscribeLocalDate(callback: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>
  const schedule = () => {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    timer = setTimeout(() => { callback(); schedule() }, midnight.getTime() - now.getTime() + 50)
  }
  const onVisible = () => { if (document.visibilityState === 'visible') callback() }
  schedule()
  document.addEventListener('visibilitychange', onVisible)
  return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
}

/** The selected Halloween treatment: margin sprites with a pointer flashlight. */
export type HalloweenVariant = 'b'

export const HALLOWEEN_VARIANTS: readonly HalloweenVariant[] = ['b']
export const DEFAULT_HALLOWEEN_VARIANT: HalloweenVariant = 'b'

/**
 * Resolves the treatment to render. `previewParam` comes from `?halloween=` and is only honoured
 * where previews are allowed: `preview` uses the default treatment, `b` is a preview alias, and
 * `off` hides it for side-by-side comparison. The `off` mode always wins.
 */
export function resolveHalloweenVariant(
  date: Date,
  mode = 'auto',
  previewParam: string | null = null,
  previewAllowed = false,
): HalloweenVariant | null {
  if (mode === 'off') return null
  const param = previewAllowed ? previewParam : null
  if (param === 'off') return null
  const picked = HALLOWEEN_VARIANTS.find((variant) => variant === param)
  const preview = param === 'preview' || picked !== undefined
  return isHalloween(date, mode, preview) ? picked ?? DEFAULT_HALLOWEEN_VARIANT : null
}
