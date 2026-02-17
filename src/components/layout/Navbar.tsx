import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Github, Download } from "lucide-react"
import DocsSearch from "@/components/docs/DocsSearch"

const SCROLL_HIDE_THRESHOLD = 100
const SCROLL_SHOW_THRESHOLD = 30

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const location = useLocation()
  const isDocs = location.pathname.startsWith("/docs")

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 50)
      // On docs, always show navbar to avoid empty space. Elsewhere, hide on scroll down.
      if (isDocs) {
        setNavVisible(true)
      } else if (y <= SCROLL_SHOW_THRESHOLD) {
        setNavVisible(true)
      } else if (y > SCROLL_HIDE_THRESHOLD) {
        setNavVisible(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDocs])

  const navLinks = [
    { name: "Features", href: "/#features", external: false },
    { name: "Scan", href: "/scan", external: false },
    { name: "Docs", href: "/docs", external: false },
    { name: "Advisories", href: "/advisories", external: false },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 navbar-slide ${scrolled
        ? "navbar-glass shadow-md"
        : "bg-transparent"
        } ${navVisible ? "navbar-visible" : "navbar-hidden"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-11 h-11 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 shadow-glow flex items-center justify-center overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}icon.png`}
                alt="MLVScan"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              MLVScan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.external === false ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full" />
                </a>
              )
            ))}
            {isDocs && (
              <div className="w-64">
                <DocsSearch />
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/ifBars/MLVScan" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button variant="accent" size="sm" className="hidden md:flex text-black" asChild>
              <a href="https://github.com/ifBars/MLVScan/releases" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden navbar-glass border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              link.external === false ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-2 text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 text-gray-300 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              )
            ))}
            <div className="pt-4 border-t dark:border-gray-800 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href="https://github.com/ifBars/MLVScan" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button variant="accent" className="w-full text-black" asChild>
                <a href="https://github.com/ifBars/MLVScan/releases" target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
