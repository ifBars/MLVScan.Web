import { describe, expect, it } from "vitest"

import {
  getAttestationTone,
  getAttestationVerdictLabel,
  getSourceBindingLabel,
  getVerificationTierLabel,
  shortenHash,
} from "@/lib/attestation-view"

describe("attestation-view", () => {
  it("maps public verdict labels by classification", () => {
    expect(getAttestationVerdictLabel("Clean", "published")).toBe("No known threats detected")
    expect(getAttestationVerdictLabel("Suspicious", "published")).toBe("Suspicious")
    expect(getAttestationVerdictLabel("KnownThreat", "published")).toBe("Known threat")
  })

  it("overrides the verdict when the attestation has been revoked", () => {
    expect(getAttestationTone("Clean", "revoked")).toBe("revoked")
    expect(getAttestationVerdictLabel("KnownThreat", "revoked")).toBe("Attestation revoked")
  })

  it("formats source binding and verification tier labels", () => {
    expect(getSourceBindingLabel("stale")).toBe("Source stale")
    expect(getVerificationTierLabel("self_submitted")).toBe("Self-submitted scan")
  })

  it("shortens long hashes while preserving the ends", () => {
    const hash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    expect(shortenHash(hash)).toBe("1234567890abcd...7890abcdef")
  })
})
