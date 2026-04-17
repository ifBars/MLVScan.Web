// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

import AttestationBadgeDesigner from "@/components/dashboard/AttestationBadgeDesigner"
import type { PublicAttestationPayload } from "@/types/attestation"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const basePayload: PublicAttestationPayload = {
  shareId: "att_test",
  verificationTier: "self_submitted",
  publicationStatus: "published",
  sourceBindingStatus: "none",
  badgeStyle: "split-pill",
  badge: {
    schemaVersion: "badge.v2",
    style: "split-pill",
    density: "compact",
    slots: {
      runtime: true,
      leftDetail: "none",
      rightDetail: "none",
    },
    brand: {
      kind: "mlvscan-check",
      label: "MLVScan attested",
    },
    tone: "clean",
    statusLabel: "Clean",
    fileLabel: "SampleMod.dll",
    verificationLabel: "Self-submitted",
    runtimeLabel: "IL2CPP",
    sourceBindingLabel: "No source",
    versionLabel: "1.0.0",
    scannedDateLabel: "2026-04-06",
    shortHashLabel: "89abcdef",
    display: {
      showRuntime: true,
      showVerification: false,
      showFile: true,
      showScannedDate: true,
      showShortHash: true,
    },
  },
  publicDisplayName: "Sample Mod",
  artifactKey: "sample-mod",
  artifactVersion: "1.0.0",
  isCurrent: true,
  supersededAt: null,
  supersededByAttestationId: null,
  supersededByShareId: null,
  fileName: "SampleMod.dll",
  canonicalSourceUrl: null,
  activeReportId: "report-1",
  contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  sizeBytes: 12345,
  scannerVersion: "1.2.3",
  schemaVersion: "1.2.0",
  scannedAt: "2026-04-06T12:00:00.000Z",
  classification: "Clean",
  headline: "No known threats detected",
  summary: "No known malware evidence was retained for these bytes.",
  blockingRecommended: false,
  primaryThreatFamilyId: null,
  threatFamilies: [],
  findings: [],
  findingCount: 0,
  publishedAt: "2026-04-06T12:05:00.000Z",
  revokedAt: null,
}

function renderDesigner(props?: Partial<ComponentProps<typeof AttestationBadgeDesigner>>) {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })
  const onSave = vi.fn()

  act(() => {
    root.render(
        <AttestationBadgeDesigner
          title="Badge settings"
          description="Configure the badge."
          payload={basePayload}
          badgeDensity={basePayload.badge?.density ?? "compact"}
          badgeSlots={basePayload.badge?.slots ?? null}
          busy={false}
          saveLabel="Save"
          onSave={onSave}
        {...props}
      />,
    )
  })

  return { onSave }
}

afterEach(() => {
  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }

  document.body.innerHTML = ""
})

describe("AttestationBadgeDesigner", () => {
  it("saves the edited runtime visibility for the compact badge", () => {
    const { onSave } = renderDesigner()

    const runtimeToggle = screen.getByRole("switch")

    act(() => {
      fireEvent.click(runtimeToggle)
    })

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }))
    })

    expect(onSave).toHaveBeenCalledWith({
      badgeDensity: "compact",
      badgeSlots: {
        runtime: false,
        leftDetail: "none",
        rightDetail: "none",
      },
    })
  })

  it("shows detailed-only detail selectors when the detailed density is selected", () => {
    const { onSave } = renderDesigner({
      badgeDensity: "detailed",
      badgeSlots: {
        runtime: true,
        leftDetail: "verification",
        rightDetail: "scanned-date",
      },
    })

    expect(screen.getByText("Left detail")).toBeTruthy()
    expect(screen.getByText("Right detail")).toBeTruthy()

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /compact/i }))
    })

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }))
    })

    expect(onSave).toHaveBeenCalledWith({
      badgeDensity: "compact",
      badgeSlots: {
        runtime: true,
        leftDetail: "none",
        rightDetail: "none",
      },
    })
  })

  it("surfaces when runtime and version metadata are unavailable for the current attestation", () => {
    renderDesigner({
      badgeDensity: "detailed",
      badgeSlots: {
        runtime: true,
        leftDetail: "none",
        rightDetail: "none",
      },
      payload: {
        ...basePayload,
        badge: {
          ...basePayload.badge!,
          density: "detailed",
          slots: {
            runtime: true,
            leftDetail: "none",
            rightDetail: "none",
          },
          runtimeLabel: null,
          versionLabel: null,
        },
        artifactVersion: null,
      },
    })

    expect(screen.queryByRole("switch")).toBeNull()
    expect(screen.getByText("Runtime isn't available for this attestation yet.")).toBeTruthy()
    expect(screen.getByText("Version isn't available for this attestation yet.")).toBeTruthy()
  })
})
