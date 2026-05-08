# Extending MLVScan.Core

This guide is for adding or changing Core analysis behavior without breaking the shared contract.

## Add A New Rule

Use this path when the rule should ship as part of MLVScan.Core's built-in scanner behavior.

1. Add the rule under `Models/Rules/`.
2. Implement `IScanRule` with a unique rule ID, severity, and description.
3. Add the rule to the list returned by `RuleFactory.CreateDefaultRules()`.
4. Add positive, false-positive, and edge-case tests.

## Add Consumer-Supplied Rules

External consumers can run their own rules alongside the built-in rules with `RuleFactory.CreateDefaultRulesWith(...)`:

```csharp
var rules = RuleFactory.CreateDefaultRulesWith(new MyCustomRule());
var scanner = new AssemblyScanner(rules);
```

Additional rules run after the built-in rules. The factory validates that every rule is non-null, has a non-blank rule ID, and does not reuse a built-in or previously added rule ID.

Custom rules can emit findings through the normal `IScanRule` hooks and those findings are included in mapped scan results. Curated threat-family matches and final disposition behavior are still owned by Core threat-intel logic; add or update `Services/ThreatIntel/` when a custom signal needs to become part of MLVScan's built-in family or blocking model.

## Keep Core Environment-Agnostic

Core should stay generic. Do not add loader-specific terminology, runtime assumptions, or environment paths to rule logic or diagnostics.

If a rule needs developer guidance, keep the wording neutral enough to work across consumers.

## When The Public Contract Changes

If you change the shared scan-result contract, update the entire chain together:

- `ScanResultMapper`
- the schema artifacts under `schema/`
- the WASM adapter surface
- downstream consumers such as the web app and runtime integrations

The intent is that one contract change produces one consistent shape everywhere, not a pile of drift.

## Testing Expectations

Add coverage when you change detection behavior:

- positive samples should still trigger the intended rule
- false positives should stay clean where expected
- quarantine or known-malware samples should keep the expected family and disposition outcomes
- repeated scans should stay deterministic

If the change affects correlation or visibility, add assertions for:

- family matches
- disposition
- default versus advanced findings

## Practical Rule Authoring Notes

Keep rule logic small and focused. If a feature starts needing correlation across multiple findings, move that behavior into the threat-intel or mapping layer instead of making the rule itself do everything.
