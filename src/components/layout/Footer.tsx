import { Link } from "react-router-dom"
import { getPartnerDashboardPath } from "@/lib/partner-dashboard-routes"

type FooterLink = {
  name: string
  href: string
  internal?: boolean
}

const groups: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { name: "Browser Scan", href: "/scan", internal: true },
      { name: "Inspector", href: "/inspector", internal: true },
      { name: "Developer Dashboard", href: getPartnerDashboardPath("home"), internal: true },
      { name: "Download", href: "https://www.nexusmods.com/site/mods/1689?tab=files" },
    ],
  },
  {
    title: "Reference",
    links: [
      { name: "Docs", href: "/docs", internal: true },
      { name: "Advisories", href: "/advisories", internal: true },
      { name: "Threat Families", href: "/advisories/families", internal: true },
      { name: "Privacy", href: "/docs/privacy", internal: true },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "GitHub", href: "https://github.com/ifBars/MLVScan" },
      { name: "Discord", href: "https://discord.gg/UD4K4chKak" },
      { name: "Nexus", href: "https://www.nexusmods.com/site/mods/1689" },
      { name: "Thunderstore", href: "https://thunderstore.io/c/schedule-i/p/ifBars/MLVScan/" },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="px-4 pb-10 pt-6 md:px-6 md:pb-14">
      <div className="mx-auto max-w-[1380px] rounded-[2rem] border border-white/10 bg-[rgba(7,12,19,0.72)] p-6 backdrop-blur-2xl md:p-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <img
                  src={`${import.meta.env.BASE_URL}icon.png`}
                  alt="MLVScan"
                  className="h-9 w-9 object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/38">MLVScan</div>
                <div className="text-lg font-medium tracking-[-0.03em] text-white">Unity mod threat inspection</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/56">
              Local browser scanning, disposition-first reporting, advisories, docs, and threat-family
              reference for cautious Unity mod workflows.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-medium uppercase tracking-[0.22em] text-white/34">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      {link.internal ? (
                        <Link
                          to={link.href}
                          className="text-sm text-white/58 transition hover:text-white"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/58 transition hover:text-white"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© 2026 MLVScan. Open source under GPL-3.0.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/docs/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link to="/docs/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <a
              href="https://github.com/ifBars/MLVScan/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
