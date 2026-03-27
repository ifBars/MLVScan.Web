# Extending MLVScan.Core

This guide is for adding or changing Core analysis behavior without breaking the shared contract.

## Add A New Rule

1. Add the rule under `Models/Rules/`.
2. Implement `IScanRule` with a unique rule ID, severity, and description.
3. Register the rule in `RuleFactory.CreateDefaultRules()`.
4. Add positive, false-positive, and edge-case tests.

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
