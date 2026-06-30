import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

describe("generated reference artifacts", () => {
  it("generates and copies Core and WASM reference docs before Pages deploys", () => {
    const workflow = readFileSync(resolve(process.cwd(), ".github", "workflows", "deploy.yml"), "utf8")
    const viteConfig = readFileSync(resolve(process.cwd(), "vite.config.ts"), "utf8")

    expect(workflow).toContain("bun run docs:generate")
    expect(workflow.indexOf("bun run docs:generate")).toBeLessThan(workflow.indexOf("bun run build"))
    expect(viteConfig).toContain("mountPath: '/docs/reference/core'")
    expect(viteConfig).toContain("sourceDir: path.resolve(__dirname, '.generated/reference/core')")
    expect(viteConfig).toContain("mountPath: '/docs/reference/wasm'")
    expect(viteConfig).toContain("sourceDir: path.resolve(__dirname, '.generated/reference/wasm')")
  })
})
