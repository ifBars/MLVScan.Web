import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, Gift, Shield, Quote, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

const TESTIMONIALS = [
  {
    text: "This is the most needed mod for people modding the game after all that s#*! that happened to the modder scene around schedule One, big thanks for it.",
    author: "Cocatox",
    platform: "Nexus",
  },
  {
    text: "thank you for your good work sir",
    author: "Echelon",
    platform: "Nexus",
  },
  {
    text: "Thank you Bars [the developer], upvoted.",
    author: "Cheese3337",
    platform: "Nexus",
  },
  {
    text: "im glad i got mlvscanner yesterday... yes ty so much bars, you saved me big time today",
    author: "Phaysed",
    platform: "Schedule 1 Modding Discord",
  },
  {
    text: "He's not biased, get MLVScan. Tbh the fact the Schedule 1 [the game] community has a thing like that [MLVScan] is a testament to you all and bar [the developer] especially.",
    author: "JustThatKing",
    platform: "Nexus Community Manager",
  },
]

const TestimonialsCarousel = () => {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [isPaused, prefersReducedMotion])

  const current = TESTIMONIALS[index]

  return (
    <div
      className="rounded-xl border border-white/5 bg-white/5 p-6 relative overflow-hidden min-h-[160px] flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute top-2 right-2 opacity-10">
        <Quote className="w-8 h-8" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Community Feedback
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
            "{current.text}"
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span className="font-semibold text-foreground/80">{current.author}</span>
            <span className="opacity-50">({current.platform})</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-teal-500/50" : "w-1 bg-white/10"}`}
          />
        ))}
      </div>
    </div>
  )
}

const TrustSection = () => {
    return (
        <section className="pt-24 pb-12 px-4 bg-background border-t border-white/5">
            <div className="container mx-auto max-w-6xl text-center">

<div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Transparency First</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Security tools require trust. We earn it by being completely open about how we work.
                    </p>
                </div>

                {/* Community Testimonials */}
                <div className="mb-12">
                    <TestimonialsCarousel />
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-left flex flex-col" role="article">
                        <Shield className="w-8 h-8 text-teal-400 mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-bold mb-2">Privacy Policy</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            We believe in data minimization. MLVScan runs entirely on your local machine. We do not upload your files, scan results, or personal data to any cloud servers.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-teal-400 group self-start cursor-pointer" asChild>
                            <Link to="/docs/privacy">
                                Read full policy <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>

                    <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-left flex flex-col" role="article">
                        <div className="w-8 h-8 mb-4 flex items-center justify-center rounded-full bg-white/10 font-mono font-bold text-sm" aria-hidden="true">
                            {"{ }"}
                        </div>
                        <h3 className="text-xl font-bold mb-2">Source Code</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            Don't take our word for it. Review our entire codebase on GitHub. Build it yourself, check the logic, or contribute back to the community.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-teal-400 group self-start cursor-pointer" asChild>
                            <a href="https://github.com/ifBars/MLVScan" target="_blank" rel="noopener noreferrer">
                                Browse repository <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </a>
                        </Button>
                    </div>

                    <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-left flex flex-col" role="article">
                        <Gift className="w-8 h-8 text-teal-400 mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-bold mb-2">Free Forever</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow">
                            No paywalls, no trial limits. MLVScan is free and open source (GPL-3.0).
                        </p>
                        <Button variant="link" className="p-0 h-auto text-teal-400 group self-start cursor-pointer" asChild>
                            <a href="https://github.com/ifBars/MLVScan/releases">
                                Get it now <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </a>
                        </Button>
                    </div>

                </div>

                <div className="mt-12 pt-12 border-t border-white/5">
                    <p className="text-sm text-muted-foreground mb-8">Trusted by the modding community on</p>
                    <div className="flex flex-wrap justify-center gap-8">
                        {/* Placeholders for logos, using text representations for now as requested by user constraints on images */}
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <img src="https://next.nexusmods.com/assets/images/default/logo.svg" alt="Nexus Mods" className="h-8 w-auto" width="120" height="32" loading="lazy" />
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <img src="https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/11347d09-c261-48d3-b025-6785a59ed3be/thunderstore-logomark-cybergreen-square.png" alt="Thunderstore" className="h-8 w-8 rounded" width="32" height="32" loading="lazy" />
                            Thunderstore
                        </div>
                        {/* Add more partners/logos here if needed */}
                    </div>
                </div>

            </div>
        </section>
    )
}

export default TrustSection
