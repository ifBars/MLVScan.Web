import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Shield, ExternalLink, ChevronDown } from "lucide-react"

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-20 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10 md:-translate-y-6">
        <div className="flex flex-col items-center text-center">

          {/* Headline with visual hierarchy */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.35rem] lg:text-6xl font-bold leading-[1.08] text-foreground text-balance max-w-4xl mb-4 animate-in fade-in slide-in-from-bottom-5 duration-200 delay-100">
            <span className="block text-3xl sm:text-4xl md:text-5xl font-medium text-muted-foreground mb-2">
              Safer modding, made simple.
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
              See what a mod does before it runs.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-200 delay-200">
            <span className="block">MLVScan scans any mod before it reaches your system.</span>
            <span className="mt-1 block text-base md:text-lg text-muted-foreground/70">
              Fast and lightweight — so nothing slows you down.
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Button size="lg" className="h-12 px-6 text-base scan-button rounded-full group min-w-[180px] shadow-lg shadow-teal-500/20" asChild>
              <Link to="/scan">
                Scan a Mod
                <Shield className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base rounded-full border-white/10 hover:bg-white/5 hover:border-white/20 min-w-[180px] backdrop-blur-sm" asChild>
              <a href="https://github.com/ifBars/MLVScan/releases" target="_blank" rel="noopener noreferrer">
                Download MLVScan
                <ExternalLink className="w-4 h-4 ml-2 opacity-60" aria-hidden="true" />
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-4">Trusted by the modding community</p>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              {[
                { label: "Downloads", value: "40k+" },
                { label: "Endorsements", value: "300+" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                  <div className="text-sm font-medium text-teal-400/90 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none mt-8 hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 sm:flex flex-col items-center gap-1.5 text-muted-foreground/70">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em]">Scroll down</span>
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/12 bg-white/4 p-1 backdrop-blur-sm">
              <div className="h-2.5 w-1 rounded-full bg-teal-300/90 animate-bounce" />
            </div>
            <ChevronDown className="h-3 w-3 animate-bounce text-teal-300/80 [animation-delay:150ms]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
