/** Canonical docs path without trailing slashes, so `/docs/privacy/` matches `/docs/privacy`. */
export const normalizeDocsPath = (pathname: string): string => pathname.replace(/\/+$/, "") || "/"

export const getDocsSlugFromPath = (pathname: string): string =>
  normalizeDocsPath(pathname).replace(/^\/docs\/?/, "")
