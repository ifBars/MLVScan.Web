import { Link } from "react-router-dom"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { homeFaqs } from "@/content/homeFaq"
import Seo from "@/components/seo/Seo"
import { getHomeSeoPage } from "@/seo/routes"
import {
  ArrowRight,
  Binary,
  ExternalLink,
  Eye,
  FileSearch2,
  GitBranch,
  LockKeyhole,
  Network,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"

const heroFindings = [
  {
    title: "Arbitrary File Write",
    detail: "System.IO.File.WriteAllBytes",
    level: "High",
    tone: "border-rose-400/20 bg-rose-400/8 text-rose-200",
  },
  {
    title: "Obfuscated Strings",
    detail: "Base64 / XOR pattern detected",
    level: "Medium",
    tone: "border-amber-300/20 bg-amber-300/8 text-amber-100",
  },
  {
    title: "Remote Request",
    detail: "UnityWebRequest to external endpoint",
    level: "Low",
    tone: "border-cyan-300/20 bg-cyan-300/8 text-cyan-100",
  },
]

const heroTrustStats = [
  { value: "70k+", label: "Downloads" },
  { value: "450+", label: "Endorsements" },
]

const featureCards = [
  {
    title: "Reads suspicious code before the loader does",
    body: "The scanner inspects .NET assemblies statically, so suspicious mods can be reviewed before they ever touch the game process.",
    icon: FileSearch2,
    accent: "from-emerald-400/22 to-emerald-400/4",
    span: "md:col-span-3",
  },
  {
    title: "Links the full attack chain",
    body: "Download, decode, file write, and launch behavior stay linked in one readable chain.",
    icon: GitBranch,
    accent: "from-cyan-400/22 to-cyan-400/4",
    span: "md:col-span-3",
  },
  {
    title: "Disposition-first reporting",
    body: "Default findings stay readable, while advanced diagnostics remain available for deeper triage.",
    icon: ShieldCheck,
    accent: "from-teal-400/22 to-teal-400/4",
    span: "md:col-span-2",
  },
  {
    title: "Built for MelonLoader and BepInEx",
    body: "Made for the Unity mod loaders people actually use, not a generic desktop antivirus flow.",
    icon: Binary,
    accent: "from-slate-300/16 to-slate-300/4",
    span: "md:col-span-2",
  },
  {
    title: "Keeps files on the device",
    body: "The browser scanner runs locally, preserving the privacy-first posture users expect from a security tool.",
    icon: LockKeyhole,
    accent: "from-rose-400/18 to-rose-400/4",
    span: "md:col-span-2",
  },
]

const proofCards = [
  {
    title: "Dispositions stay clear",
    copy: "Outcome chips anchor the read: Clean, Suspicious, or Known Threat.",
    icon: ShieldCheck,
  },
  {
    title: "Threat families stay visible",
    copy: "Related campaigns surface as families instead of loose findings.",
    icon: Eye,
  },
  {
    title: "Advanced diagnostics stay available",
    copy: "Call chains and data flow stay one click away when the default summary is not enough.",
    icon: Network,
  },
]

const communityQuotes = [
  {
    quote:
      "This is the most needed mod for people modding the game after all that happened to the modder scene.",
    author: "Cocatox",
    source: "Nexus",
  },
  {
    quote:
      "I’m glad I got MLVScan yesterday. You saved me big time today.",
    author: "Phaysed",
    source: "Schedule 1 Modding Discord",
  },
  {
    quote:
      "The fact the community has something like MLVScan is a testament to the work behind it.",
    author: "JustThatKing",
    source: "Nexus Community Manager",
  },
]

const container = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      staggerChildren: 0.12,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

const HomePage = () => {
  return (
    <>
      <Seo page={getHomeSeoPage()} />
      <main className="landing-shell overflow-x-hidden">
        <section className="relative isolate min-h-[100dvh] overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-34 lg:min-h-0 lg:pb-14 lg:pt-30">
          <div className="landing-noise pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[50rem] bg-[radial-gradient(circle_at_18%_18%,rgba(39,210,190,0.2),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(84,179,255,0.18),transparent_28%),radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.06),transparent_40%)] [mask-image:linear-gradient(180deg,black_0%,black_72%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_72%,transparent_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(5,10,16,0.52)_58%,rgba(5,10,16,0.94)_100%)]"
            aria-hidden="true"
          />

          <motion.div
            className="relative mx-auto flex w-full max-w-[1380px] flex-col gap-14 lg:min-h-[42rem] lg:flex-row lg:items-start"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div className="relative z-10 lg:max-w-[33rem]" variants={item}>
              <p className="text-[clamp(1.1rem,1.55vw,1.55rem)] font-medium tracking-[-0.03em] text-white/56">
                Safer modding, made simple.
              </p>

              <h1 className="mt-4 max-w-[13ch] text-[clamp(3.2rem,5vw,5.65rem)] font-semibold leading-[0.9] tracking-[-0.058em] text-white">
                <span className="block whitespace-nowrap">See what a mod</span>
                <span className="block whitespace-nowrap">does before it runs.</span>
              </h1>

              <p className="mt-8 max-w-[30rem] text-lg leading-8 text-white/64 md:text-[1.05rem]">
                MLVScan scans suspicious .NET assemblies locally before they ever run in-game, so you
                can review risky behavior without uploading files.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-14 rounded-2xl border border-cyan-200/18 bg-[linear-gradient(135deg,#49d2f2,#2f91c6)] px-7 text-[0.97rem] font-semibold text-white transition-transform duration-500 hover:-translate-y-0.5"
                  asChild
                >
                  <Link to="/scan">
                    Scan a Mod
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-2xl border-cyan-300/30 bg-slate-950/24 px-7 text-[0.97rem] text-white hover:bg-white/9"
                  asChild
                >
                  <a
                    href="https://www.nexusmods.com/site/mods/1689?tab=files"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download MLVScan
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <p className="mt-4 flex items-center gap-3 text-sm leading-6 text-white/52">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <ShieldCheck className="h-4 w-4 text-cyan-100" />
                </span>
                <span>Need a guide first?</span>
                <Link
                  to="/docs/unity-mod-antivirus"
                  className="inline-flex items-center gap-2 text-white/76 transition hover:text-white"
                >
                  Learn how MLVScan checks Unity mods for malware
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </p>

              <div className="mt-5 max-w-[22rem] border-t border-white/10 pt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/34">
                  Trusted by the modding community
                </p>
                <div className="mt-4 grid grid-cols-2 gap-6">
                  {heroTrustStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-4xl font-semibold tracking-[-0.05em] text-white">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-base font-medium text-teal-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative mx-auto mt-8 w-full max-w-[900px] lg:absolute lg:right-0 lg:top-2 lg:mt-0 lg:w-[60%] lg:max-w-none"
              variants={item}
            >
              <div className="pointer-events-none absolute right-[10%] top-[2%] h-44 w-56 rounded-full bg-cyan-300/16 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-y-[18%] left-[5%] w-24 bg-[radial-gradient(circle,rgba(73,210,242,0.18),transparent_72%)] blur-2xl" aria-hidden="true" />

              <div className="relative origin-top-right rotate-0 lg:scale-[0.78] lg:rotate-[-3.8deg]">
                <div className="landing-panel relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[0_32px_140px_rgba(3,7,18,0.72)] sm:p-6">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%)]" aria-hidden="true" />

                  <div className="relative flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-slate-950/56 px-4 py-3 text-xs text-white/48">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-white/24" />
                      <span>ExampleMod.dll</span>
                      <span className="rounded-md bg-cyan-300/12 px-2 py-0.5 text-cyan-100">IL2CPP</span>
                    </div>
                    <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-amber-100">
                      Suspicious
                    </span>
                  </div>

                  <div className="relative mt-5 grid gap-0 overflow-hidden rounded-[1.7rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,15,24,0.98),rgba(11,18,28,0.9))] lg:grid-cols-[0.26fr_0.74fr]">
                    <div className="border-b border-white/6 bg-[linear-gradient(180deg,rgba(9,16,24,0.98),rgba(8,12,20,0.88))] p-4 lg:border-b-0 lg:border-r">
                      <div className="space-y-3">
                        {["Summary", "Findings", "Attack Path", "Behavior", "Code Insights", "Metadata"].map((entry, index) => (
                          <div
                            key={entry}
                            className={`rounded-xl px-3 py-3 text-sm ${index === 0 ? "bg-cyan-300/12 text-cyan-100" : "text-white/48"}`}
                          >
                            {entry}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white/88">Findings</p>
                            <p className="mt-1 text-xs text-white/44">3 issues discovered</p>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="rounded-lg border border-rose-400/20 bg-rose-400/8 px-2.5 py-1 text-rose-200">High 1</span>
                            <span className="rounded-lg border border-amber-300/20 bg-amber-300/8 px-2.5 py-1 text-amber-100">Medium 1</span>
                            <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 px-2.5 py-1 text-cyan-100">Low 1</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {heroFindings.map((finding) => (
                            <div
                              key={finding.title}
                              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/30 px-4 py-3"
                            >
                              <div>
                                <div className="text-sm font-medium text-white/86">{finding.title}</div>
                                <div className="mt-1 text-xs text-white/42">{finding.detail}</div>
                              </div>
                              <span className={`rounded-lg border px-2.5 py-1 text-xs ${finding.tone}`}>
                                {finding.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4">
                        <p className="text-sm font-medium text-white/88">Attack Path</p>
                        <p className="mt-1 text-xs text-white/44">Potential execution flow leading to impact</p>
                        <div className="mt-4 grid gap-3 xl:grid-cols-4">
                          {[
                            { title: "Mod Entry", sub: "Awake()" },
                            { title: "Decode", sub: "XOR string" },
                            { title: "Network", sub: "Get request" },
                            { title: "File Write", sub: "WriteAllBytes" },
                          ].map((step, index) => (
                            <div key={step.title} className="relative rounded-xl border border-white/10 bg-slate-950/32 px-4 py-3">
                              <div className="text-sm font-medium text-white/84">{step.title}</div>
                              <div className="mt-1 text-xs text-white/42">{step.sub}</div>
                              {index < 3 ? (
                                <span className="absolute -right-2 top-1/2 hidden h-px w-4 bg-white/16 xl:block" />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4">
                        <div>
                          <p className="text-sm font-medium text-white/88">Disposition</p>
                          <p className="mt-1 text-xs text-white/44">Overall assessment</p>
                        </div>
                        <div className="rounded-xl border border-amber-300/18 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
                          Suspicious
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </section>

        <section className="px-4 py-24 md:px-6 md:py-32">
          <motion.div
            className="mx-auto max-w-[1380px]"
            initial="show"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
          >
            <motion.div
              variants={item}
              className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.28em] text-white/34">Investigation surface</p>
                <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                  Catch the full attack path without turning the page into dashboard clutter.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-white/58 md:text-lg">
                MLVScan shows how a suspicious assembly behaves, from first load to network or file
                system impact, without making you sift through raw noise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-flow-dense">
              {featureCards.map((card) => {
                const Icon = card.icon
                return (
                  <motion.article
                    key={card.title}
                    variants={item}
                    className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition-transform duration-700 hover:-translate-y-1.5 ${card.span}`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-80 transition-transform duration-700 group-hover:scale-105`}
                      aria-hidden="true"
                    />
                    <div className="relative flex h-full flex-col">
                      <div className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/44 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="max-w-sm text-2xl font-semibold tracking-[-0.03em] text-white">
                        {card.title}
                      </h3>
                      <p className="mt-4 max-w-md text-sm leading-7 text-white/60 md:text-[0.98rem]">
                        {card.body}
                      </p>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-24 md:px-6 md:py-36">
          <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm uppercase tracking-[0.28em] text-white/34">Disposition workflow</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                From raw indicators to a readable outcome.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/58 md:text-lg">
                Clean, Suspicious, and Known Threat give you the first answer fast, while findings,
                families, and deeper diagnostics stay available when you want the details.
              </p>

              <div className="mt-10 space-y-4">
                {proofCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.title}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                          <Icon className="h-5 w-5 text-teal-100" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/58">{card.copy}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <motion.div
              className="space-y-5"
              initial="show"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={container}
            >
              <motion.article
                variants={item}
                className="landing-panel group relative overflow-hidden rounded-[2rem] border border-white/10 p-6 transition-transform duration-700 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,14,24,0.62),rgba(27,48,58,0.32))]" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/34">Analyst summary</p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
                        Browser scan result
                      </h3>
                    </div>
                    <div className="rounded-full border border-rose-300/18 bg-rose-300/10 px-3 py-1 text-xs font-medium text-rose-100">
                      Known Threat
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/46 p-5">
                      <p className="text-sm font-medium text-white/82">Primary reasons</p>
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-white/58">
                        <li className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-200" />
                          Hidden loader path stages a downloaded assembly in memory.
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-200" />
                          Reflection chain obscures the real execution target.
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-200" />
                          Network destination overlaps known suspicious family behavior.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.045] p-5">
                      <p className="text-sm font-medium text-white/82">Visible outcomes</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Known Threat", "Threat family match", "Advanced diagnostics", "Call chain"].map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/72"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>

              <motion.article
                variants={item}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { name: "Clean", value: "No suspicious chain surfaced", tone: "text-emerald-100 bg-emerald-300/10 border-emerald-300/16" },
                    { name: "Suspicious", value: "Review recommended", tone: "text-amber-100 bg-amber-300/10 border-amber-300/16" },
                    { name: "Known Threat", value: "Family behavior matched", tone: "text-rose-100 bg-rose-300/10 border-rose-300/16" },
                  ].map((state) => (
                    <div key={state.name} className={`rounded-[1.5rem] border p-5 ${state.tone}`}>
                      <p className="text-xs uppercase tracking-[0.18em] opacity-70">Disposition</p>
                      <div className="mt-3 text-xl font-semibold tracking-[-0.03em]">{state.name}</div>
                      <p className="mt-3 text-sm leading-6 opacity-80">{state.value}</p>
                    </div>
                  ))}
                </div>
              </motion.article>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-24 md:px-6 md:py-32">
          <motion.div
            className="mx-auto max-w-[1380px]"
            initial="show"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
          >
            <motion.div variants={item} className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-white/34">Trust surface</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                Built for people who want proof before they run a mod.
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <motion.article
                variants={item}
                className="relative overflow-hidden rounded-[2.1rem] border border-white/10 bg-white/[0.045] p-8"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(93,232,214,0.12),transparent_30%)]" aria-hidden="true" />
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/34">Community notes</p>
                  <div className="mt-8 grid gap-4">
                    {communityQuotes.map((quote) => (
                      <div
                        key={quote.author}
                        className="rounded-[1.5rem] border border-white/8 bg-slate-950/38 p-5"
                      >
                        <p className="text-lg leading-8 text-white/82">"{quote.quote}"</p>
                        <div className="mt-4 text-sm text-white/42">
                          {quote.author} | {quote.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>

              <div className="grid gap-5">
                <motion.article
                  variants={item}
                  className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,22,34,0.95),rgba(18,42,47,0.68))] p-7"
                >
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    Runs locally in the browser
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    Scans run in your browser, so suspicious assemblies stay on your device while you
                    review them.
                  </p>
                  <Button variant="link" className="mt-5 h-auto p-0 text-teal-200 hover:text-white" asChild>
                    <Link to="/docs/privacy">Read privacy docs</Link>
                  </Button>
                </motion.article>

                <motion.article
                  variants={item}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-7"
                >
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    Open source and reviewable
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    Source, docs, advisories, and threat-family pages are public so you can verify how
                    MLVScan works and follow new findings.
                  </p>
                  <Button variant="link" className="mt-5 h-auto p-0 text-teal-200 hover:text-white" asChild>
                    <a href="https://github.com/ifBars/MLVScan" target="_blank" rel="noopener noreferrer">
                      Browse repository
                    </a>
                  </Button>
                </motion.article>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-24 md:px-6 md:py-32">
          <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/34">Questions</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                Questions people ask before trusting a mod.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/58 md:text-lg">
                These are the common questions modders ask before they scan a file or install a loader.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 md:p-6">
              <Accordion type="single" collapsible className="space-y-3">
                {homeFaqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/34 px-5"
                  >
                    <AccordionTrigger className="text-left text-lg font-medium text-white hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-7 text-white/58">
                      {faq.answer}
                      {index === 1 ? (
                        <>
                          {" "}
                          See the{" "}
                          <Link
                            to="/docs/automated-reporting-data-handling"
                            className="text-teal-200 underline decoration-white/16 underline-offset-4"
                          >
                            automated reporting docs
                          </Link>
                          .
                        </>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 pt-10 md:px-6 md:pb-24">
          <div className="mx-auto max-w-[1380px]">
            <div className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,24,0.96),rgba(18,45,49,0.78))] px-6 py-10 sm:px-8 md:px-12 md:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(70,232,211,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(97,165,255,0.12),transparent_28%)]" aria-hidden="true" />
              <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.28em] text-white/42">Start here</p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                    Check a mod before you trust it.
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/64 md:text-lg">
                    Run a local browser scan or move through docs, advisories, and threat families
                    before anything reaches your game.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="h-14 rounded-full border border-teal-300/25 bg-[linear-gradient(135deg,#44e3cb,#16bfb1)] px-7 text-[0.97rem] font-semibold text-slate-950 shadow-[0_24px_80px_rgba(24,191,176,0.32)]"
                    asChild
                  >
                    <Link to="/scan">Start A Browser Scan</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-full border-white/14 bg-white/5 px-7 text-[0.97rem] text-white hover:bg-white/9"
                    asChild
                  >
                    <Link to="/docs">Read The Docs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage
