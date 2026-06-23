import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"

function workflow(path: string): string {
  return readFileSync(path, "utf8")
}

function stepIndex(contents: string, name: string): number {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = new RegExp(`- name: ${escapedName}\\r?\\n`).exec(contents)
  return match?.index ?? -1
}

describe("CI workflow drift guards", () => {
  it("keeps public-site deploy gated by Core contract validation", () => {
    const deploy = workflow(".github/workflows/deploy.yml")

    expect(deploy).toContain("git clone --depth 1 https://github.com/ifBars/MLVScan.Core ../MLVScan.Core")
    expect(deploy).toContain("MLVScan.Core.Tests/MLVScan.Core.Tests.csproj")
    expect(deploy).toContain("dotnet workload restore ../MLVScan.Core/MLVScan.Core.Tests/MLVScan.Core.Tests.csproj")
    expect(deploy).toContain("MLVScanVersionsTests.CoreVersion_MatchesDirectoryBuildPropsVersion")
    expect(deploy).toContain("bun run docs:generate")
    expect(deploy).toContain("bun run build")
    expect(stepIndex(deploy, "Verify Core version drift guard")).toBeLessThan(stepIndex(deploy, "Generate reference docs"))
    expect(stepIndex(deploy, "Generate reference docs")).toBeLessThan(stepIndex(deploy, "Build"))
  })

  it("keeps dependency update workflow scoped to the published WASM package", () => {
    const update = workflow(".github/workflows/update-wasm-core.yml")

    expect(update).toContain("bun update @mlvscan/wasm-core")
    expect(update).toContain("chore(deps): update @mlvscan/wasm-core")
    expect(update).not.toContain("npm ")
    expect(update).not.toContain("pnpm ")
    expect(update).not.toContain("yarn ")
  })
})
