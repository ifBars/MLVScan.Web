import type {
  AttestationBadgeSlots,
  BadgeDensity,
  PublicAttestationPayload,
} from "@/types/attestation"

export type PartnerAccountStatus = "active" | "suspended"
export type PartnerAuthMethod = "discord" | "shared_key" | null
export type PartnerTier = "free" | "partner"
export type PartnerWorkspaceView = "home" | "publish" | "attestations" | "access"
export type PublishStage = "idle" | "uploading" | "polling" | "ready" | "publishing"

export interface PartnerProfile {
  id: string
  name: string
  email: string
  status: PartnerAccountStatus
  maxKeys: number
  tierRestriction: PartnerTier
  requestedTier: PartnerTier | null
  authMethod: PartnerAuthMethod
  discordUsername: string | null
  defaultBadgeStyle: "split-pill"
  defaultBadgeDensity: BadgeDensity
  defaultBadgeSlots: AttestationBadgeSlots
}

export interface PartnerSessionResponse {
  partner: PartnerProfile
  csrfToken: string
}

export interface PartnerAuthProviders {
  discordOAuthEnabled: boolean
  devDiscordLoginEnabled: boolean
}

export interface PartnerApiKey {
  id: string
  prefix: string
  label: string | null
  tier: string
  active: boolean
  ownerType: string
  ownerId: string | null
  createdBy: string | null
  scopes: string[] | null
  revokedAt: string | null
  expiresAt: string | null
  createdAt: string
  lastUsedAt: string | null
}

export interface PartnerCreateKeyInput {
  label?: string
  tier: PartnerTier
  expiresAt?: string
}

export interface PartnerCreateKeyResponse {
  id: string
  plaintextKey: string
  prefix: string
  label: string | null
  tier: string
  ownerType: string
  createdAt: string
  warning: string
}

export interface PartnerRotateKeyResponse {
  id: string
  plaintextKey: string
  prefix: string
  label: string | null
  tier: string
  rotatedAt: string
  warning: string
}

export interface PartnerAttestationSummary extends PublicAttestationPayload {
  id: string
  createdAt: string
  refreshedAt: string | null
  publicUrl: string
  badgeUrl: string
}

export interface PartnerAttestationDraftInput {
  submissionId: string
  artifactKey: string
  artifactVersion?: string
  publicDisplayName?: string
  canonicalSourceUrl?: string
  badgeDensity?: BadgeDensity
  badgeSlots?: AttestationBadgeSlots | null
}

export interface PartnerAttestationBadgeStyleInput {
  badgeStyle: string
}

export interface PartnerAttestationBadgeConfigInput {
  badgeDensity: BadgeDensity
  badgeSlots: AttestationBadgeSlots | null
}

export interface PartnerAttestationMetadataInput {
  artifactKey: string
  artifactVersion?: string
  publicDisplayName?: string
  canonicalSourceUrl?: string
}

export interface PartnerBadgePreferencesInput {
  defaultBadgeDensity: BadgeDensity
  defaultBadgeSlots: AttestationBadgeSlots | null
}

export interface PartnerUploadResponse {
  data: {
    id: string
    type: "analysis"
    links?: {
      self?: string
    }
  }
}

export interface PartnerSubmissionMetadata {
  loaderType?: string
}

export interface PartnerUploadUrlResponse {
  data: {
    upload_url: string
    submission_id: string
    expires_in: number
    upload_method: "PUT"
  }
}

export interface PartnerReportResponse {
  reportId: string
  status: "pending" | "processing" | "completed" | "failed"
  result?: unknown
  error?: string
  createdAt: string
  completedAt?: string
}

export interface PublishFormState {
  publicDisplayName: string
  artifactKey: string
  artifactVersion: string
  canonicalSourceUrl: string
  badgeDensity: BadgeDensity
  badgeSlots: AttestationBadgeSlots
}

export interface PublishFlowState {
  stage: PublishStage
  message: string
  attestationId: string | null
  submissionId: string | null
  reportId: string | null
}

export interface ShareOutputs {
  markdown: string
  bbcode: string
}
