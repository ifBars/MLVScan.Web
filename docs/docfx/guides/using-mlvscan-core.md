# Using MLVScan.Core

`MLVScan.Core` gives you two layers of output:

1. Low-level scanner findings from individual rules and analysis passes.
2. A higher-level result contract that adds threat-family matches and a final disposition.

For most integrations, the recommended workflow is:

1. Create the built-in rules with `RuleFactory.CreateDefaultRules()`.
2. Scan an assembly with `AssemblyScanner`.
3. Map the findings with `ScanResultMapper.ToDto(...)`.
4. Read `result.Findings`, `result.ThreatFamilies`, and `result.Disposition`.

## Install

```bash
dotnet add package MLVScan.Core
```

## Choose The Right API Level

| If you need... | Use... |
|---|---|
| Raw rule findings | `AssemblyScanner.Scan(...)` |
| Threat-family matches plus the shared result schema | `ScanResultMapper.ToDto(...)` |
| Threat-family matching only in a custom pipeline | `ThreatFamilyClassifier.Classify(...)` |
| Final disposition only in a custom pipeline | `ThreatDispositionClassifier.Classify(...)` |

If you are building a product surface, report format, API payload, or UI, prefer `ScanResultMapper`. It is the public contract used across Core consumers and already runs the family and disposition pipeline for you.

## End-To-End Example

This example scans a DLL, keeps the low-level findings, and then produces the shared `ScanResultDto`.

```csharp
using System.Text.Json;
using MLVScan;
using MLVScan.Models;
using MLVScan.Models.Dto;
using MLVScan.Services;

var filePath = @"C:\mods\ExampleMod.dll";
var fileName = Path.GetFileName(filePath);
var assemblyBytes = File.ReadAllBytes(filePath);

using var stream = new MemoryStream(assemblyBytes);

var scanner = new AssemblyScanner(
    RuleFactory.CreateDefaultRules(),
    new ScanConfig
    {
        EnableCrossMethodAnalysis = true,
        EnableReturnValueTracking = true
    });

var findings = scanner.Scan(stream, fileName).ToList();

var result = ScanResultMapper.ToDto(
    findings,
    fileName,
    assemblyBytes,
    new ScanResultOptions
    {
        Platform = "my-tool",
        PlatformVersion = "1.0.0",
        IncludeCallChains = true,
        IncludeDataFlows = true,
        IncludeDeveloperGuidance = false
    });

Console.WriteLine($"Disposition: {result.Disposition?.Classification}");
Console.WriteLine($"Threat families: {result.ThreatFamilies?.Count ?? 0}");
Console.WriteLine($"Default findings: {result.Findings.Count(f => f.Visibility == \"Default\")}");

Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions
{
    WriteIndented = true
}));
```

## Getting Raw Scan Findings

`AssemblyScanner.Scan(...)` returns `IEnumerable<ScanFinding>`. Each `ScanFinding` is a low-level signal emitted by a rule or analysis pass.

```csharp
using MLVScan;
using MLVScan.Services;

var scanner = new AssemblyScanner(RuleFactory.CreateDefaultRules());
var findings = scanner.Scan(@"C:\mods\ExampleMod.dll").ToList();

foreach (var finding in findings)
{
    Console.WriteLine($"[{finding.Severity}] {finding.RuleId} at {finding.Location}");
    Console.WriteLine(finding.Description);
}
```

A `ScanFinding` can also carry:

- `CallChain` when cross-method analysis has reconstructed an execution path.
- `DataFlowChain` when the scanner has tracked source -> transform -> sink behavior.
- `DeveloperGuidance` when a rule can explain a safer or more remediable alternative.
- `RiskScore` for rules that expose a numeric score in addition to severity.

Raw findings are useful for internal tools, tests, or expert workflows. They are not the full product-level verdict on their own.

## Getting Threat Families And The Final Disposition

The easiest way to get threat families and the final disposition is to map findings with `ScanResultMapper.ToDto(...)`.

```csharp
var result = ScanResultMapper.ToDto(findings, fileName, assemblyBytes, developerMode: false);

var disposition = result.Disposition;
```

The mapped result adds:

- `result.ThreatFamilies`: known malware family matches, if any.
- `result.Disposition`: the final retained verdict for the file.
- `result.Findings[*].Visibility`: whether a finding should appear in default views or only advanced views.
- `result.CallChains`, `result.DataFlows`, and `result.DeveloperGuidance` when those options are enabled.

### Reading Threat Families

Each threat family match explains how the classifier recognized a known family:

- `FamilyId` and `VariantId` identify the matched family and behavior variant.
- `MatchKind` is `ExactSampleHash` or `BehaviorVariant`.
- `Confidence` is normalized between `0` and `1`.
- `MatchedRules` lists the low-level rules that contributed to the match.
- `Evidence` gives the concrete context, including locations, call-chain IDs, data-flow IDs, and pattern names.

```csharp
if (result.ThreatFamilies != null)
{
    foreach (var family in result.ThreatFamilies)
    {
        Console.WriteLine($"{family.DisplayName} ({family.MatchKind}, confidence {family.Confidence:0.00})");

        foreach (var evidence in family.Evidence)
        {
            Console.WriteLine($"- {evidence.Kind}: {evidence.Value}");
        }
    }
}
```

## What The Final Disposition Means

The final disposition is not just a copy of the highest finding severity. It is produced after threat-family matching and correlation.

### `KnownThreat`

`KnownThreat` means the scan matched a known malware family.

This happens when the classifier finds either:

- An exact malicious sample hash match.
- A known behavior variant match from the built-in threat-family catalog.

When this happens:

- `Disposition.PrimaryThreatFamilyId` is set.
- `Disposition.BlockingRecommended` is `true`.
- `Disposition.RelatedFindingIds` points at the findings that support the retained verdict.

Exact hash matches outrank behavior matches when both are present.

### `Suspicious`

`Suspicious` means the file did not match a known family, but the retained evidence still shows correlated high-confidence suspicious behavior.

Examples include:

- Suspicious data-flow patterns such as `DownloadAndExecute`, `DynamicCodeLoading`, or `EmbeddedResourceDropAndExecute`.
- Strong standalone findings such as `ObfuscatedReflectiveExecutionRule`.
- Multiple correlated high-severity findings that share a location, call chain, or data-flow chain.

When this happens:

- `Disposition.BlockingRecommended` is `true`.
- `Disposition.RelatedFindingIds` identifies the findings that should be shown by default.

### `Clean`

`Clean` means there was no known family match and no retained suspicious seed after correlation.

Important: an isolated high-severity primitive finding can still produce a `Clean` final disposition if it does not correlate strongly enough to justify a user-facing suspicious verdict.

When this happens:

- `Disposition.BlockingRecommended` is `false`.
- Findings usually remain available as advanced diagnostics instead of the default verdict evidence.

## How Finding Visibility Works

`ScanResultMapper` marks findings as either:

- `Default`: directly related to the retained disposition.
- `Advanced`: useful supporting diagnostics, but not part of the default user-facing verdict.

This is why a result can still contain findings even when the final disposition is `Clean`. The findings are still present, but they were not retained as the primary verdict evidence.

## Custom Family And Disposition Pipelines

If you want direct control over classification, you can call the classifiers yourself.

```csharp
using System.Security.Cryptography;
using MLVScan.Services.ThreatIntel;

var callChains = findings
    .Where(finding => finding.HasCallChain)
    .Select(finding => finding.CallChain!)
    .Distinct()
    .ToList();

var dataFlows = findings
    .Where(finding => finding.HasDataFlow)
    .Select(finding => finding.DataFlowChain!)
    .Distinct()
    .ToList();

var sha256Hash = Convert.ToHexString(SHA256.HashData(assemblyBytes)).ToLowerInvariant();

var familyClassifier = new ThreatFamilyClassifier();
var threatFamilies = familyClassifier.Classify(findings, callChains, dataFlows, sha256Hash);

var dispositionClassifier = new ThreatDispositionClassifier();
var disposition = dispositionClassifier.Classify(findings, threatFamilies);
```

Use this only if you need a custom pipeline. For most consumers, `ScanResultMapper` is still the better starting point because it keeps you aligned with the shared schema contract.

## Configuring The Scanner

`ScanConfig` controls how much analysis the scanner performs. The defaults are the recommended baseline.

Common options:

- `EnableCrossMethodAnalysis`: lets call chains and data flows cross method boundaries.
- `MaxCallChainDepth`: controls how far cross-method exploration can go.
- `EnableReturnValueTracking`: keeps data-flow analysis connected through method returns.
- `EnableRecursiveResourceScanning`: scans embedded managed assemblies found inside resources.
- `MaxRecursiveResourceSizeMB`: limits recursive resource scanning cost.
- `DetectAssemblyMetadata`: inspects metadata-backed payload and string hiding techniques.

For best family matching and disposition quality, keep the default analysis features enabled unless you have a strong performance or hosting constraint.

## Resolving Referenced Assemblies

If your target assembly depends on external libraries that are not on the default probe path, pass a custom `IAssemblyResolverProvider`.

```csharp
using MLVScan.Abstractions;
using Mono.Cecil;

sealed class SearchDirectoryResolverProvider : IAssemblyResolverProvider
{
    private readonly string[] _searchDirectories;

    public SearchDirectoryResolverProvider(params string[] searchDirectories)
    {
        _searchDirectories = searchDirectories;
    }

    public IAssemblyResolver CreateResolver()
    {
        var resolver = new DefaultAssemblyResolver();

        foreach (var directory in _searchDirectories)
        {
            resolver.AddSearchDirectory(directory);
        }

        return resolver;
    }
}

var scanner = new AssemblyScanner(
    RuleFactory.CreateDefaultRules(),
    resolverProvider: new SearchDirectoryResolverProvider(
        @"C:\Game\Managed",
        @"C:\mods\dependencies"));
```

This keeps Mono.Cecil resolution predictable and improves scan consistency when a mod references game or shared framework assemblies.

## Recommended Consumer Pattern

If you are building a downstream consumer, treat the outputs like this:

- `ScanFinding`: low-level evidence.
- `ThreatFamilies`: known-family correlation built on top of that evidence.
- `Disposition`: the primary user-facing verdict built on top of family matches and retained suspicious behavior.

That ordering is intentional. Consumers should not derive their primary verdict from a single rule severity when `Disposition` is available.

For member-level API details, continue to the [API Reference](/docs/reference/core/api/).
