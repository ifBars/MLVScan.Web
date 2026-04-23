import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Download, Menu, X } from "lucide-react"
import DocsSearch from "@/components/docs/DocsSearch"
import { getPartnerDashboardPath } from "@/lib/partner-dashboard-routes"

const NAV_LINKS = [
  { name: "Scan", href: "/scan" },
  { name: "Inspector", href: "/inspector" },
  { name: "Docs", href: "/docs" },
  { name: "Advisories", href: "/advisories" },
  { name: "Threat Families", href: "/advisories/families" },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isElevated, setIsElevated] = useState(false)
  const location = useLocation()
  const isDocs = location.pathname.startsWith("/docs")

  useEffect(() => {
    const handleScroll = () => setIsElevated(window.scrollY > 28)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto max-w-[1380px] rounded-[1.6rem] border transition-all duration-500 ${
          isElevated
            ? "border-white/12 bg-[rgba(7,12,19,0.82)] shadow-[0_18px_80px_rgba(2,6,23,0.38)] backdrop-blur-2xl"
            : "border-white/8 bg-[rgba(7,12,19,0.56)] backdrop-blur-xl"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-5">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <img
                src={`${import.meta.env.BASE_URL}icon.png`}
                alt="MLVScan"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/38">MLVScan</div>
              <div className="text-sm text-white/72">Unity Mod Antivirus</div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                location.pathname === link.href ||
                (link.href !== "/" && location.pathname.startsWith(link.href))

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isDocs ? (
              <div className="w-72">
                <DocsSearch />
              </div>
            ) : null}

            <Button
              variant="outline"
              className="h-10 rounded-full border-white/12 bg-white/[0.03] px-4 text-white hover:bg-white/8 hover:text-white"
              asChild
            >
              <Link to={getPartnerDashboardPath("home")}>Dashboard</Link>
            </Button>
            <Button
              className="h-10 rounded-full border border-teal-300/25 bg-[linear-gradient(135deg,#44e3cb,#16bfb1)] px-4 text-slate-950 shadow-[0_18px_40px_rgba(24,191,176,0.28)]"
              asChild
            >
              <a href="https://github.com/ifBars/MLVScan/releases" target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white transition hover:bg-white/8 lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-white/10 px-4 pb-4 pt-3 lg:hidden">
            <div className="grid gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/76 transition hover:bg-white/8 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {isDocs ? (
              <div className="mt-3">
                <DocsSearch />
              </div>
            ) : null}

            <div className="mt-3 grid gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-full border-white/12 bg-white/[0.03] text-white hover:bg-white/8 hover:text-white"
                asChild
              >
                <Link to={getPartnerDashboardPath("home")} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              </Button>
              <Button
                className="h-11 rounded-full border border-teal-300/25 bg-[linear-gradient(135deg,#44e3cb,#16bfb1)] text-slate-950"
                asChild
              >
                <a
                  href="https://github.com/ifBars/MLVScan/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  )
}

export default Navbar
