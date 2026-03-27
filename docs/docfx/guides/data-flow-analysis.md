# Data Flow Analysis

Data-flow analysis tracks how a value moves through code, not just which opcode appeared in isolation. It is most useful when a suspicious behavior depends on a sequence of operations such as load, decode, transform, and sink.

## Why It Matters

Rule-based detection can tell you that a method uses a sink. Data-flow analysis tells you whether the data reaching that sink came from a network source, a decoded payload, or another suspicious transformation.

That makes it easier to distinguish:

- a benign helper that only decodes data
- a suspicious loader that decodes and then executes
- a multi-step chain that moves a payload from source to sink

## Chain Model

Each `DataFlowChain` captures:

- a source
- one or more transforms
- one or more sinks
- an overall pattern classification
- a confidence value

The nodes are intentionally simple so they can be rendered in reports without duplicating the analysis logic in the UI.

## Example Flow

```text
[SOURCE] NetworkDownload.GetBytes
  -> [TRANSFORM] Convert.FromBase64String
  -> [SINK] File.WriteAllBytes
  -> [SINK] Process.Start
```

That sequence is more meaningful than any one step by itself. The chain shows the data moving from acquisition, to transformation, to a final action.

## What Consumers Should Look For

When consuming `ScanFinding` values directly, check `HasDataFlow` before trying to read the chain.

```csharp
foreach (var finding in findings)
{
    if (!finding.HasDataFlow || finding.DataFlowChain == null)
    {
        continue;
    }

    Console.WriteLine(finding.DataFlowChain.Pattern);
    Console.WriteLine(finding.DataFlowChain.ToDetailedDescription());
}
```

The most useful fields for consumers are:

- `Pattern`: the high-level behavioral shape
- `Confidence`: the strength of the chain
- `IsCrossMethod`: whether the flow crossed method boundaries
- `InvolvedMethods`: the methods that participated in the chain

## Common Patterns

The core project uses data-flow analysis to support patterns such as:

- download and execute behavior
- data exfiltration paths
- dynamic code loading
- remote configuration loading
- obfuscated persistence chains

These should be treated as behavioral evidence that contributes to the final disposition, not as a standalone verdict replacement.

## Configuration Guidance

`ScanConfig` controls the amount of data-flow work the scanner performs. The important knobs are:

- `EnableCrossMethodAnalysis`
- `MaxCallChainDepth`
- `EnableReturnValueTracking`

The defaults are the right starting point for most consumers. Lower the budget only if you have a concrete performance constraint and you can tolerate less context in the result.

## Consumer Guidance

Use data-flow output when you need to explain *why* a retained verdict was produced.

- It makes suspicious chains easier to review.
- It helps connect low-level rules to a higher-level family match.
- It reduces false-positive confusion by showing the full source-to-sink path.

If you are building a product surface, surface the chain summary first and keep the node list available as drill-down detail.
