import { Link } from "react-router-dom"
import { Github } from "lucide-react"

type FooterLink = {
  name: string
  href: string
  internal?: boolean
}

const Footer = () => {
  const links: Record<string, FooterLink[]> = {
    product: [
      { name: "Download", href: "https://www.nexusmods.com/site/mods/1689?tab=files" },
      { name: "GitHub", href: "https://github.com/ifBars/MLVScan" },
      { name: "Scan Online", href: "/scan", internal: true },
    ],
    resources: [
      { name: "Documentation", href: "/docs", internal: true },
      { name: "Advisories", href: "/advisories", internal: true },
      { name: "Report Issue", href: "https://github.com/ifBars/MLVScan/issues" },
    ],
    community: [
      { name: "Discord", href: "https://discord.gg/UD4K4chKak" },
      { name: "Nexus", href: "https://www.nexusmods.com/site/mods/1689" },
      { name: "Thunderstore", href: "https://thunderstore.io/c/schedule-i/p/ifBars/MLVScan/" },
    ],
  }

  return (
    <footer className="border-t border-white/10 bg-[rgba(10,12,16,0.92)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-11 h-11 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 shadow-glow flex items-center justify-center overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}icon.png`}
                  alt="MLVScan"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MLVScan
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Security-focused scanner for Unity mods. Protect your gaming experience.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/ifBars/MLVScan" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-teal-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/UD4K4chKak" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-gray-400 hover:text-teal-300 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  {link.internal ? (
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  {link.internal ? (
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target={link.href.startsWith("#") ? "_self" : "_blank"}
                      rel={link.href.startsWith("#") ? undefined : "noopener noreferrer"}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-100 mb-4">Community</h4>
            <ul className="space-y-2">
              {links.community.map((link) => (
                <li key={link.name}>
                  {link.internal ? (
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 MLVScan. All rights reserved. Open source under GPL-3.0.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Link to="/docs/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/docs/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="https://github.com/ifBars/MLVScan/blob/master/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">License</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
