import { afterEach, describe, expect, it, vi } from "vitest"

import {
  clearPartnerDashboardSessionState,
  createPartnerAttestationDraft,
  deletePartnerAttestationDraft,
  getPartnerSession,
  uploadSubmission,
  updatePartnerAttestationBadgeConfig,
  updatePartnerAttestationMetadata,
  updatePartnerBadgePreferences,
} from "./partner-dashboard-api"

describe("partner-dashboard-api", () => {
  afterEach(() => {
    clearPartnerDashboardSessionState()
    vi.unstubAllGlobals()
  })

  it("reuses the session csrf token for attestation badge config updates", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          partner: {
            id: "partner-1",
            name: "Partner",
            email: "partner@example.com",
            status: "active",
            maxKeys: 5,
            tierRestriction: "partner",
            requestedTier: "partner",
            authMethod: "discord",
            discordUsername: "PartnerUser",
            defaultBadgeStyle: "split-pill",
            defaultBadgeDensity: "compact",
            defaultBadgeSlots: { runtime: true, leftDetail: "none", rightDetail: "none" },
          },
          csrfToken: "csrf-123",
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          id: "attestation-1",
          shareId: "att_test",
          verificationTier: "self_submitted",
          publicationStatus: "draft",
          sourceBindingStatus: "none",
          badgeStyle: "split-pill",
          badge: {
            schemaVersion: "badge.v2",
            style: "split-pill",
            density: "compact",
            slots: { runtime: false, leftDetail: "none", rightDetail: "none" },
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
              showRuntime: false,
              showVerification: false,
              showFile: false,
              showScannedDate: false,
              showShortHash: false,
            },
          },
          publicDisplayName: "Sample Mod",
          artifactKey: "sample-mod",
          artifactVersion: "1.0.0",
          isCurrent: false,
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
          publishedAt: null,
          revokedAt: null,
          createdAt: "2026-04-06T12:05:00.000Z",
          refreshedAt: null,
          publicUrl: "http://localhost:3000/attestations/att_test",
          badgeUrl: "http://localhost:3000/attestations/att_test/badge.svg",
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )

    vi.stubGlobal("fetch", fetchMock)

    await getPartnerSession()
    const result = await updatePartnerAttestationBadgeConfig("attestation-1", {
      badgeDensity: "detailed",
      badgeSlots: {
        runtime: false,
        leftDetail: "verification",
        rightDetail: "scanned-date",
      },
    })

    expect(result.badge?.display?.showRuntime).toBe(false)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/partner/attestations/attestation-1/badge-config",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.any(Headers),
      }),
    )

    const secondCall = fetchMock.mock.calls[1]
    const headers = secondCall?.[1]?.headers as Headers
    expect(headers.get("X-CSRF-Token")).toBe("csrf-123")
  })

  it("round-trips partner default badge preferences", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        partner: {
          id: "partner-1",
          name: "Partner",
          email: "partner@example.com",
          status: "active",
          maxKeys: 5,
          tierRestriction: "partner",
          requestedTier: "partner",
          authMethod: "discord",
          discordUsername: "PartnerUser",
          defaultBadgeStyle: "split-pill",
          defaultBadgeDensity: "detailed",
          defaultBadgeSlots: {
            runtime: true,
            leftDetail: "verification",
            rightDetail: "none",
          },
        },
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    )

    vi.stubGlobal("fetch", fetchMock)

    const partner = await updatePartnerBadgePreferences({
      defaultBadgeDensity: "detailed",
      defaultBadgeSlots: {
        runtime: true,
        leftDetail: "verification",
        rightDetail: "none",
      },
    })

    expect(partner.defaultBadgeStyle).toBe("split-pill")
    expect(partner.defaultBadgeSlots.leftDetail).toBe("verification")
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/partner/badge-preferences",
      expect.objectContaining({
        method: "POST",
      }),
    )
  })

  it("sanitizes draft metadata updates and sends them to the metadata route", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          partner: {
            id: "partner-1",
            name: "Partner",
            email: "partner@example.com",
            status: "active",
            maxKeys: 5,
            tierRestriction: "partner",
            requestedTier: "partner",
            authMethod: "discord",
            discordUsername: "PartnerUser",
            defaultBadgeStyle: "split-pill",
            defaultBadgeDensity: "compact",
            defaultBadgeSlots: { runtime: true, leftDetail: "none", rightDetail: "none" },
          },
          csrfToken: "csrf-123",
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          id: "attestation-1",
          shareId: "att_test",
          verificationTier: "self_submitted",
          publicationStatus: "draft",
          sourceBindingStatus: "declared",
          badgeStyle: "split-pill",
          badge: {
            schemaVersion: "badge.v2",
            style: "split-pill",
            density: "compact",
            slots: { runtime: true, leftDetail: "none", rightDetail: "none" },
            brand: { kind: "mlvscan-check", label: "MLVScan attested" },
            tone: "clean",
            statusLabel: "Clean",
            fileLabel: "SampleMod.dll",
            verificationLabel: "Self-submitted",
            runtimeLabel: "Mono",
            sourceBindingLabel: "Declared source",
            versionLabel: "1.0.1",
            scannedDateLabel: "2026-04-06",
            shortHashLabel: "89abcdef",
          },
          publicDisplayName: "Sample Mod",
          artifactKey: "sample-mod",
          artifactVersion: "1.0.1",
          isCurrent: false,
          supersededAt: null,
          supersededByAttestationId: null,
          supersededByShareId: null,
          fileName: "SampleMod.dll",
          canonicalSourceUrl: "https://example.com/mod",
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
          publishedAt: null,
          revokedAt: null,
          createdAt: "2026-04-06T12:05:00.000Z",
          refreshedAt: null,
          publicUrl: "http://localhost:3000/attestations/att_test",
          badgeUrl: "http://localhost:3000/attestations/att_test/badge.svg",
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )

    vi.stubGlobal("fetch", fetchMock)

    await getPartnerSession()
    await updatePartnerAttestationMetadata("attestation-1", {
      artifactKey: " sample-mod ",
      artifactVersion: " 1.0.1 ",
      publicDisplayName: " Sample Mod ",
      canonicalSourceUrl: " https://example.com/mod ",
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/partner/attestations/attestation-1/metadata",
      expect.objectContaining({
        method: "POST",
      }),
    )

    const secondCall = fetchMock.mock.calls[1]
    expect(JSON.parse(String(secondCall?.[1]?.body))).toEqual({
      artifactKey: "sample-mod",
      artifactVersion: "1.0.1",
      publicDisplayName: "Sample Mod",
      canonicalSourceUrl: "https://example.com/mod",
    })
  })

  it("uses DELETE for draft removal", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          partner: {
            id: "partner-1",
            name: "Partner",
            email: "partner@example.com",
            status: "active",
            maxKeys: 5,
            tierRestriction: "partner",
            requestedTier: "partner",
            authMethod: "discord",
            discordUsername: "PartnerUser",
            defaultBadgeStyle: "split-pill",
            defaultBadgeDensity: "compact",
            defaultBadgeSlots: { runtime: true, leftDetail: "none", rightDetail: "none" },
          },
          csrfToken: "csrf-123",
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    vi.stubGlobal("fetch", fetchMock)

    await getPartnerSession()
    await deletePartnerAttestationDraft("attestation-1")

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/partner/attestations/attestation-1",
      expect.objectContaining({
        method: "DELETE",
      }),
    )
  })

  it("omits blank optional draft fields so the API schema accepts draft creation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        id: "attestation-1",
        shareId: "att_test",
        verificationTier: "self_submitted",
        publicationStatus: "draft",
        sourceBindingStatus: "none",
        badgeStyle: "split-pill",
        badge: {
          schemaVersion: "badge.v2",
          style: "split-pill",
          density: "compact",
          slots: { runtime: true, leftDetail: "none", rightDetail: "none" },
          brand: { kind: "mlvscan-check", label: "MLVScan attested" },
          tone: "clean",
          statusLabel: "Clean",
          fileLabel: "SampleMod.dll",
          verificationLabel: "Self-submitted",
          runtimeLabel: "Mono",
          sourceBindingLabel: "No source",
          versionLabel: null,
          scannedDateLabel: "2026-04-06",
          shortHashLabel: "89abcdef",
        },
        publicDisplayName: "Sample Mod",
        artifactKey: "sample-mod",
        artifactVersion: null,
        isCurrent: false,
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
        publishedAt: null,
        revokedAt: null,
        createdAt: "2026-04-06T12:05:00.000Z",
        refreshedAt: null,
        publicUrl: "http://localhost:3000/attestations/att_test",
        badgeUrl: "http://localhost:3000/attestations/att_test/badge.svg",
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    )

    vi.stubGlobal("fetch", fetchMock)

    await createPartnerAttestationDraft({
      submissionId: "submission-1",
      artifactKey: "sample-mod",
      artifactVersion: "",
      publicDisplayName: "Sample Mod",
      canonicalSourceUrl: "",
      badgeDensity: "compact",
      badgeSlots: {
        runtime: true,
        leftDetail: "none",
        rightDetail: "none",
      },
    })

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(requestInit).toBeDefined()
    expect(requestInit?.body).toBeDefined()
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      submissionId: "submission-1",
      artifactKey: "sample-mod",
      publicDisplayName: "Sample Mod",
      badgeDensity: "compact",
      badgeSlots: {
        runtime: true,
        leftDetail: "none",
        rightDetail: "none",
      },
    })
  })

  it("includes submission metadata in direct dashboard uploads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          id: "submission-1",
          type: "analysis",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    vi.stubGlobal("fetch", fetchMock)

    const file = new File(["assembly"], "SampleMod.dll", { type: "application/x-msdownload" })
    await uploadSubmission(file, { loaderType: "detected-il2cpp" })

    const [, requestInit] = fetchMock.mock.calls[0]
    expect(requestInit?.body).toBeInstanceOf(FormData)
    const formData = requestInit?.body as FormData
    expect(formData.get("metadata")).toBe(JSON.stringify({ loaderType: "detected-il2cpp" }))
  })
})
