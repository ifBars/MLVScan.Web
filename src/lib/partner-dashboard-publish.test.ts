import { describe, expect, it } from "vitest"

import type { PublishFormState } from "@/types/partner-dashboard"

import {
  applyDetectedPublishMetadata,
  getDraftPublishBlockReason,
} from "./partner-dashboard-publish"

function createPublishForm(overrides: Partial<PublishFormState> = {}): PublishFormState {
  return {
    publicDisplayName: "",
    artifactKey: "",
    artifactVersion: "",
    canonicalSourceUrl: "",
    badgeDensity: "compact",
    badgeSlots: {
      runtime: true,
      leftDetail: "none",
      rightDetail: "none",
    },
    ...overrides,
  }
}

describe("partner dashboard publish helpers", () => {
  it("autofills version when the publish form is still blank", () => {
    const nextForm = applyDetectedPublishMetadata(
      createPublishForm(),
      { artifactVersion: "1.2.3" },
    )

    expect(nextForm.artifactVersion).toBe("1.2.3")
  })

  it("preserves a manually entered version when detected metadata arrives", () => {
    const nextForm = applyDetectedPublishMetadata(
      createPublishForm({ artifactVersion: "2.0.0-custom" }),
      { artifactVersion: "1.2.3" },
    )

    expect(nextForm.artifactVersion).toBe("2.0.0-custom")
  })

  it("blocks publishing suspicious drafts", () => {
    expect(getDraftPublishBlockReason({
      publicationStatus: "draft",
      classification: "Suspicious",
    } as const)).toContain("contact ifbars on Discord")
  })

  it("blocks publishing known-threat drafts", () => {
    expect(getDraftPublishBlockReason({
      publicationStatus: "draft",
      classification: "KnownThreat",
    } as const)).toContain("known threat")
  })

  it("allows clean drafts to continue to publish", () => {
    expect(getDraftPublishBlockReason({
      publicationStatus: "draft",
      classification: "Clean",
    } as const)).toBeNull()
  })
})
