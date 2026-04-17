// @vitest-environment jsdom

import { act, type ComponentProps } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"

import DashboardBadgeDefaultsPanel from "@/components/dashboard/DashboardBadgeDefaultsPanel"
import type { PartnerProfile } from "@/types/partner-dashboard"
import type { PublicAttestationPayload } from "@/types/attestation"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const partner: PartnerProfile = {
  id: "partner-1",
  name: "Local Dev Partner",
  email: "local@example.test",
  status: "active",
  maxKeys: 5,
  tierRestriction: "partner",
  requestedTier: null,
  authMethod: "shared_key",
  discordUsername: null,
  defaultBadgeStyle: "split-pill",
  defaultBadgeDensity: "compact",
  defaultBadgeSlots: {
    runtime: true,
    leftDetail: "none",
    rightDetail: "none",
  },
}

const payload: PublicAttestationPayload = {
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

function renderPanel(props?: Partial<ComponentProps<typeof DashboardBadgeDefaultsPanel>>) {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  const onBack = vi.fn()
  const onSave = vi.fn()

  act(() => {
    root.render(
      <DashboardBadgeDefaultsPanel
        partner={partner}
        payload={payload}
        busy={false}
        onBack={onBack}
        onSave={onSave}
        {...props}
      />,
    )
  })

  return { onBack, onSave }
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

describe("DashboardBadgeDefaultsPanel", () => {
  it("returns to the ledger and maps saved settings to partner defaults", () => {
    const { onBack, onSave } = renderPanel()

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /back to ledger/i }))
    })

    expect(onBack).toHaveBeenCalledTimes(1)

    act(() => {
      fireEvent.click(screen.getByRole("switch"))
    })

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /save defaults/i }))
    })

    expect(onSave).toHaveBeenCalledWith({
      defaultBadgeDensity: "compact",
      defaultBadgeSlots: {
        runtime: false,
        leftDetail: "none",
        rightDetail: "none",
      },
    })
  })
})
