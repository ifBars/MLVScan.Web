# Call Chain Analysis

Call-chain analysis collapses declaration and call-site noise into one path that starts at a reachable method and ends at the suspicious operation. The goal is not to prove intent from a single rule; it is to show how behavior is actually invoked.

## Why It Matters

Traditional rule output can over-report the same pattern multiple times:

- a suspicious declaration
- an intermediate helper call
- an externally reachable entry point

Call-chain analysis groups those pieces into one retained path so consumers can show a single actionable explanation instead of three disconnected warnings.

## How It Is Represented

Each `CallChain` is an ordered list of `CallChainNode` items:

| Node type | Meaning |
|---|---|
| `EntryPoint` | A reachable method where the behavior begins |
| `IntermediateCall` | A hop between the entry point and the suspicious operation |
| `SuspiciousDeclaration` | The dangerous declaration or sink at the end of the chain |

The chain also carries a summary, severity, and stable identifier that consumers can use for cross-linking.

## Example Chain

```text
[ENTRY] Plugin.Initialize: reaches Helper.Run
  -> [CALL] Helper.Run:42
    -> [DECL] NativeBridge.Execute
```

That shape tells you three things at once:

- where the behavior becomes reachable
- whether it is routed through helper code
- what the final dangerous declaration is

## Building And Reading Chains

If you are consuming `ScanFinding` values directly, check `HasCallChain` before rendering chain details.

```csharp
foreach (var finding in findings)
{
    if (!finding.HasCallChain || finding.CallChain == null)
    {
        continue;
    }

    Console.WriteLine(finding.CallChain.Summary);
    Console.WriteLine(finding.CallChain.ToDetailedDescription());
}
```

The detailed description is usually what you want to show in a report or UI. It preserves the full path without requiring the consumer to reconstruct method relationships itself.

## Consumer Guidance

Use call-chain data as evidence, not as the verdict by itself.

- `ScanFinding` remains the low-level signal.
- `CallChain` explains reachability and invocation path.
- `ThreatFamilies` and `Disposition` decide the user-facing verdict.

If you are grouping findings, prefer the chain identifier over the raw description text. That keeps the UI stable even when descriptions change.

## When To Enable It

Keep call-chain analysis enabled when you need:

- retained verdict explanations
- report readability
- correlation with threat-family evidence
- better triage for multi-step behavior

If you disable it for performance reasons, expect less context in both the final disposition and downstream reports.
