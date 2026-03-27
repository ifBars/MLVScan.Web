import type { PartnerWorkspaceView } from "@/types/partner-dashboard"

const PARTNER_DASHBOARD_PATHS: Record<PartnerWorkspaceView, string> = {
  home: "/dashboard",
  publish: "/dashboard/submit",
  attestations: "/dashboard/attestations",
  access: "/dashboard/access",
}

export function getPartnerDashboardPath(view: PartnerWorkspaceView): string {
  return PARTNER_DASHBOARD_PATHS[view]
}

export function getPartnerDashboardView(pathname: string): PartnerWorkspaceView | null {
  const normalizedPathname = normalizePathname(pathname)

  switch (normalizedPathname) {
    case "/dashboard":
      return "home"
    case "/dashboard/submit":
      return "publish"
    case "/dashboard/attestations":
      return "attestations"
    case "/dashboard/access":
      return "access"
    default:
      return null
  }
}

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/"
  }

  const trimmedPathname = pathname.replace(/\/+$/, "")
  return trimmedPathname === "" ? "/" : trimmedPathname
}
