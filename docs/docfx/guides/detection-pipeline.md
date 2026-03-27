# Detection Pipeline

`MLVScan.Core` uses a layered detection model. Rules are the low-level signal layer. Threat-family classification and the final disposition sit on top of those signals and produce the primary product verdict.

## Pipeline Overview

1. Scanner services analyze assemblies and emit `ScanFinding` values.
2. Threat-family classifiers correlate those findings into `ThreatFamilyMatch` values.
3. The disposition classifier derives the retained verdict from the findings and family matches.
4. `ScanResultMapper` turns the internal result into the shared DTO/schema contract.

That order matters. Consumers should not treat raw rule severity as the final user-facing outcome when `Disposition` is available.

## What Each Layer Means

### `ScanFinding`

`ScanFinding` is the foundational evidence object. It describes a single signal or correlated signal with location, severity, and optional context such as call chains, data flows, and developer guidance.

### `ThreatFamilyMatch`

Threat-family matches explain when the observed evidence aligns with a known malware family or family variant. These matches are built from the low-level findings and supporting evidence.

### `ThreatDispositionResult`

The disposition is the final product verdict for a file. The important classifications are:

- `KnownThreat`
- `Suspicious`
- `Clean`

The disposition can also reference a primary family and the retained findings that support the verdict.

### Finding Visibility

`ScanResultMapper` also separates findings into default and advanced visibility. That lets consumer UIs show the evidence that supports the retained verdict first, while still keeping diagnostic signals available for deeper review.

## Practical Rule Guidance

When you add or adjust a rule:

- keep the rule deterministic
- treat it as a signal source, not the final verdict
- add positive and false-positive coverage
- register the rule in `RuleFactory`

When you change how findings correlate:

- update the disposition logic
- update the shared result contract if needed
- verify downstream consumers still render the right primary outcome

## Reading Results In Consumers

For a UI or report, the recommended order is:

1. show the disposition headline
2. show any matched threat family
3. show the default findings that support the verdict
4. expose advanced findings only as drill-down evidence

That keeps the presentation aligned with the actual decision model and avoids severity-first triage mistakes.

## Related Guides

- [Using MLVScan.Core](using-mlvscan-core.md)
- [Call Chain Analysis](call-chain-analysis.md)
- [Data Flow Analysis](data-flow-analysis.md)
- [Extending MLVScan.Core](extending-mlvscan-core.md)
