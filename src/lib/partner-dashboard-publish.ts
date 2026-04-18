import type { AttestationPublishMetadata } from "@/lib/attestation-publish-metadata"
import type { PartnerAttestationSummary, PublishFormState } from "@/types/partner-dashboard"

export function applyDetectedPublishMetadata(
  form: PublishFormState,
  metadata: Pick<AttestationPublishMetadata, "artifactVersion">,
): PublishFormState {
  if (form.artifactVersion.trim().length > 0 || !metadata.artifactVersion) {
    return form
  }

  return {
    ...form,
    artifactVersion: metadata.artifactVersion,
  }
}

export function getDraftPublishBlockReason(
  attestation: Pick<PartnerAttestationSummary, "publicationStatus" | "classification"> | null,
): string | null {
  if (!attestation || attestation.publicationStatus !== "draft") {
    return null
  }

  if (attestation.classification === "Suspicious") {
    return "This draft cannot be published because MLVScan classified these exact bytes as suspicious. If you believe this is a false positive, contact ifbars on Discord."
  }

  if (attestation.classification === "KnownThreat") {
    return "This draft cannot be published because MLVScan classified these exact bytes as a known threat. If you believe this is a false positive, contact ifbars on Discord."
  }

  return null
}
