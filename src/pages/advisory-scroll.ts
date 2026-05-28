export function shouldScrollAdvisoryDetailToTop(slug: string | undefined, hash: string): boolean {
  return Boolean(slug && !hash)
}
