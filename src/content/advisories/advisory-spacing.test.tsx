// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const readContentFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8")

const contentRoot = path.resolve(process.cwd(), "src/content")
const inlineBoundaryTags = "(?:code|strong|em|a|Link)"

const findMdxFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return findMdxFiles(entryPath)
    }

    return entry.name.endsWith(".mdx") ? [entryPath] : []
  })

const findInlineBoundarySpacingIssues = (filePath: string) => {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  const issues: string[] = []
  let activeTextContainer: "p" | "li" | null = null

  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index].trim()
    const nextLine = lines[index + 1].trim()

    const openingTextContainer = line.match(/<(p|li)\b/)
    if (openingTextContainer) {
      activeTextContainer = openingTextContainer[1] as "p" | "li"
    }

    const closesActiveTextContainer =
      activeTextContainer !== null && new RegExp(`</${activeTextContainer}>`).test(line)

    if (!activeTextContainer || closesActiveTextContainer || !nextLine || nextLine.startsWith("{String.raw")) {
      if (closesActiveTextContainer) {
        activeTextContainer = null
      }
      continue
    }

    const inlineCloseBeforeText = new RegExp(`</${inlineBoundaryTags}>$`).test(line) && /^[A-Za-z0-9%]/.test(nextLine)
    const textBeforeInlineOpen =
      /[A-Za-z0-9.,;:!?)]$/.test(line) &&
      new RegExp(`^<${inlineBoundaryTags}\\b`).test(nextLine) &&
      !line.endsWith('{" "}')

    if (inlineCloseBeforeText || textBeforeInlineOpen) {
      issues.push(`${path.relative(process.cwd(), filePath)}:${index + 1}`)
    }

    if (closesActiveTextContainer) {
      activeTextContainer = null
    }
  }

  return issues
}

describe("advisory and family content spacing", () => {
  it("requires explicit spaces when prose wraps across inline JSX elements", () => {
    const issues = findMdxFiles(contentRoot).flatMap(findInlineBoundarySpacingIssues)

    expect(issues).toEqual([])
  })

  it("keeps explicit JSX spaces around inline verdict prose in the UnlimitedGraffiti advisory", () => {
    const source = readContentFile("src/content/advisories/2026-03-malware-unlimitedgraffiti.mdx")

    expect(source).toContain('exposed.{" "}')
    expect(source).toContain("<code>HttpClient</code>{\" \"}")
    expect(source).toContain("before{\" \"}")
  })

  it("keeps explicit JSX spaces between observed variant filenames in the web download family page", () => {
    const source = readContentFile("src/content/families/webdownload-stage-exec-v3.mdx")

    expect(source).toContain("</code>,{\" \"}")
    expect(source).toContain("</code>, and{\" \"}")
  })

  it("keeps explicit JSX spaces between observed variant filenames in the resource-shell32 family page", () => {
    const source = readContentFile("src/content/families/resource-shell32-tempcmd-v2.mdx")

    expect(source).toContain("</code>,{\" \"}")
    expect(source).toContain("</code>, and{\" \"}")
  })
})
