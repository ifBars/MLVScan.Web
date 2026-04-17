// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const readContentFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

describe("advisory and family content spacing", () => {
  it("keeps explicit JSX spaces around inline verdict prose in the UnlimitedGraffiti advisory", () => {
    const source = readContentFile("src/content/advisories/2026-03-malware-unlimitedgraffiti.mdx")

    expect(source).toContain('compromise of the original{" "}')
    expect(source).toContain('could still surface as{" "}')
    expect(source).toContain('This classification gap is fixed in{" "}')
    expect(source).toContain('family, while{" "}')
  })

  it("keeps explicit JSX spaces between observed variant filenames in the web download family page", () => {
    const source = readContentFile("src/content/families/webdownload-stage-exec-v2.mdx")

    expect(source).toContain("</code>,{\" \"}")
    expect(source).toContain("</code>, and{\" \"}")
  })

  it("keeps explicit JSX spaces between observed variant filenames in the resource-shell32 family page", () => {
    const source = readContentFile("src/content/families/resource-shell32-tempcmd-v2.mdx")

    expect(source).toContain("</code>,{\" \"}")
    expect(source).toContain("</code>, and{\" \"}")
  })
})
