import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Shield, ExternalLink } from "lucide-react"

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 hero-glow -z-10" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Headline with visual hierarchy */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-foreground text-balance max-w-2xl mb-4 animate-in fade-in slide-in-from-bottom-5 duration-200 delay-100">
            <span className="block text-3xl sm:text-4xl md:text-5xl font-medium text-muted-foreground mb-2">
              Mod safely. Play confidently.
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
              MLVScan has your back.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground/90 max-w-xl text-balance mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-200 delay-200">
            Lightweight protection that scans every mod before you play—keeping your game safe without slowing you down.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
            <Button size="lg" className="h-12 px-6 text-base scan-button rounded-full group min-w-[180px] shadow-lg shadow-teal-500/20" asChild>
              <Link to="/scan">
                Scan File Now
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

          {/* Simplified Stats - 2 columns instead of 4 */}
          <div className="mt-12 pt-6 border-t border-white/5 grid grid-cols-2 gap-8 md:gap-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            {[
              { label: "Downloads", value: "40k+", sub: "NexusMods & Thunderstore" },
              { label: "Endorsements", value: "300+", sub: "NexusMods" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-teal-400/90 mt-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
