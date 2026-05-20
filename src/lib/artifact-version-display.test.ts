import { describe, expect, it } from "vitest"

import {
  getDisplayArtifactVersion,
  shouldShowFullArtifactVersionTitle,
} from "@/lib/artifact-version-display"

describe("artifact version display", () => {
  it("hides SemVer build metadata from compact UI labels", () => {
    expect(getDisplayArtifactVersion("3.0.3+594f848d676ad7fafb78988724947aa77b39f8bb"))
      .toBe("3.0.3")
    expect(shouldShowFullArtifactVersionTitle("3.0.3+594f848d676ad7fafb78988724947aa77b39f8bb"))
      .toBe(true)
  })

  it("keeps normal versions unchanged", () => {
    expect(getDisplayArtifactVersion("1.0.0")).toBe("1.0.0")
    expect(shouldShowFullArtifactVersionTitle("1.0.0")).toBe(false)
  })
})
