import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  ChevronLeft,
  House,
  KeyRound,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  PanelLeft,
} from "lucide-react"
import { toast } from "sonner"

import ApiKeysPanel from "@/components/dashboard/ApiKeysPanel"
import AttestationLedger from "@/components/dashboard/AttestationLedger"
import DashboardBadgeDefaultsPanel from "@/components/dashboard/DashboardBadgeDefaultsPanel"
import DashboardDetailPanel from "@/components/dashboard/DashboardDetailPanel"
import DashboardHome from "@/components/dashboard/DashboardHome"
import PartnerAuthScreen from "@/components/dashboard/PartnerAuthScreen"
import PartnerStatusScreen from "@/components/dashboard/PartnerStatusScreen"
import PublishWorkspace from "@/components/dashboard/PublishWorkspace"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  buildPartnerAuthUrl,
  clearPartnerDashboardSessionState,
  createPartnerApiKey,
  createPartnerAttestationDraft,
  deletePartnerAttestationDraft,
  getPartnerAuthProviders,
  getPartnerSession,
  getPartnerReport,
  listPartnerApiKeys,
  listPartnerAttestations,
  loginWithSharedKey,
  PartnerNotFoundError,
  logoutPartner,
  PartnerUnauthorizedError,
  publishPartnerAttestation,
  refreshPartnerAttestation,
  revokePartnerApiKey,
  revokePartnerAttestation,
  rotatePartnerApiKey,
  updatePartnerAttestationBadgeConfig,
  updatePartnerAttestationMetadata,
  updatePartnerBadgePreferences,
  uploadSubmission,
} from "@/lib/partner-dashboard-api"
import { buildAttestationPublishMetadata, toAttestationUploadMetadata } from "@/lib/attestation-publish-metadata"
import {
  countCurrentAttestations,
  countSupersededAttestations,
  findCurrentAttestationForArtifactKey,
  isCurrentAttestation,
} from "@/lib/attestation-lineage"
import {
  getPartnerDashboardPath,
  getPartnerDashboardView,
} from "@/lib/partner-dashboard-routes"
import { scanAssembly } from "@/lib/scanner"
import { cn, copyTextToClipboard } from "@/lib/utils"
import type {
  PartnerApiKey,
  PartnerAttestationBadgeConfigInput,
  PartnerAttestationMetadataInput,
  PartnerAttestationSummary,
  PartnerAuthProviders,
  PartnerBadgePreferencesInput,
  PartnerCreateKeyInput,
  PartnerCreateKeyResponse,
  PartnerProfile,
  PartnerRotateKeyResponse,
  PartnerWorkspaceView,
  PublishFlowState,
  PublishFormState,
  ShareOutputs,
} from "@/types/partner-dashboard"
import type {
  PublicAttestationPayload,
} from "@/types/attestation"

const REPORT_POLL_INTERVAL_MS = 2_000
const REPORT_POLL_TIMEOUT_MS = 3 * 60 * 1_000

const EMPTY_AUTH_PROVIDERS: PartnerAuthProviders = {
  discordOAuthEnabled: false,
  devDiscordLoginEnabled: false,
}
const PARTNER_DASHBOARD_RETURN_PATH_KEY = "mlvscan.partner-dashboard.return-path"
type PublishTextField =
  | "publicDisplayName"
  | "artifactKey"
  | "artifactVersion"
  | "canonicalSourceUrl"

const workspaceItems: Array<{
  value: PartnerWorkspaceView
  label: string
  icon: typeof Sparkles
  badge?: string
}> = [
    {
      value: "home",
      label: "Home",
      icon: House,
    },
    {
      value: "publish",
      label: "Submit",
      icon: Sparkles,
    },
    {
      value: "attestations",
      label: "Ledger",
      icon: BadgeCheck,
    },
    {
      value: "access",
      label: "Access",
      icon: KeyRound,
    },
  ]

export default function PartnerDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const requestedWorkspaceView = getPartnerDashboardView(location.pathname)

  const [booting, setBooting] = useState(true)
  const [authBusy, setAuthBusy] = useState(false)
  const [refreshBusy, setRefreshBusy] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [badgeDefaultsOpen, setBadgeDefaultsOpen] = useState(false)

  const [authProviders, setAuthProviders] =
    useState<PartnerAuthProviders>(EMPTY_AUTH_PROVIDERS)
  const [authMessage, setAuthMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaceError, setWorkspaceError] = useState("")

  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [workspaceView, setWorkspaceView] =
    useState<PartnerWorkspaceView>(requestedWorkspaceView ?? "home")

  const [keys, setKeys] = useState<PartnerApiKey[]>([])
  const [keysLoading, setKeysLoading] = useState(false)
  const [attestations, setAttestations] = useState<PartnerAttestationSummary[]>(
    [],
  )
  const [attestationsLoading, setAttestationsLoading] = useState(false)
  const [selectedAttestationId, setSelectedAttestationId] = useState<string | null>(
    null,
  )
  const [badgeConfigBusyId, setBadgeConfigBusyId] = useState<string | null>(null)
  const [metadataBusyId, setMetadataBusyId] = useState<string | null>(null)
  const [draftDeleteBusyId, setDraftDeleteBusyId] = useState<string | null>(null)
  const [partnerBadgePreferencesBusy, setPartnerBadgePreferencesBusy] = useState(false)

  const [publishForm, setPublishForm] = useState<PublishFormState>(
    initialPublishForm(),
  )
  const [publishFlow, setPublishFlow] = useState<PublishFlowState>(
    initialPublishFlow(),
  )
  const [publishFile, setPublishFile] = useState<File | null>(null)
  const [publishError, setPublishError] = useState("")
  const publishFlowAbortControllerRef = useRef<AbortController | null>(null)
  const publishFlowRunIdRef = useRef(0)

  const selectedAttestation =
    attestations.find((attestation) => attestation.id === selectedAttestationId) ??
    null
  const badgePreviewPayload = buildBadgePreviewPayload(selectedAttestation)
  const shareOutputs = buildShareOutputs(selectedAttestation)
  const activeWorkspace =
    workspaceItems.find((item) => item.value === workspaceView) ?? workspaceItems[0]

  const publishedCount = countCurrentAttestations(attestations)
  const draftCount = attestations.filter(
    (attestation) => attestation.publicationStatus === "draft",
  ).length
  const supersededCount = countSupersededAttestations(attestations)
  const activeKeyCount = keys.filter(
    (keyRecord) => keyRecord.active && !keyRecord.revokedAt,
  ).length

  function handleSelectWorkspace(value: PartnerWorkspaceView): void {
    setDetailSheetOpen(false)
    setBadgeDefaultsOpen(false)
    setSidebarOpen(false)
    navigateToWorkspace(value)
  }

  function handleOpenProfileSheet(): void {
    setSidebarOpen(false)
    setProfileSheetOpen(true)
  }

  function shouldUseMobileDetailSheet(): boolean {
    if (typeof window === "undefined") {
      return true
    }

    return window.matchMedia("(max-width: 1279px)").matches
  }

  function handleCloseAttestationDetail(): void {
    setDetailSheetOpen(false)
  }

  function handleOpenBadgeDefaults(): void {
    setDetailSheetOpen(false)
    setBadgeDefaultsOpen(true)
  }

  function handleCloseBadgeDefaults(): void {
    setBadgeDefaultsOpen(false)
  }

  function resetWorkspaceState(): void {
    cancelPublishFlowRun()
    setKeys([])
    setAttestations([])
    setSelectedAttestationId(null)
    setWorkspaceError("")
    setPublishForm(initialPublishForm())
    setPublishFlow(initialPublishFlow())
    setPublishFile(null)
    setPublishError("")
    startTransition(() => setWorkspaceView(requestedWorkspaceView ?? "home"))
  }

  function navigateToWorkspace(
    value: PartnerWorkspaceView,
    options?: { replace?: boolean },
  ): void {
    const nextPath = getPartnerDashboardPath(value)

    if (location.pathname === nextPath) {
      startTransition(() => setWorkspaceView(value))
      return
    }

    navigate(nextPath, { replace: options?.replace })
  }

  function setAuthedPartner(nextPartner: PartnerProfile | null): void {
    setPartner(nextPartner)
    if (!nextPartner) {
      clearPartnerDashboardSessionState()
      resetWorkspaceState()
    }
  }

  async function loadWorkspaceData(signal?: AbortSignal): Promise<boolean> {
    setKeysLoading(true)
    setAttestationsLoading(true)
    setWorkspaceError("")

    const [keysResult, attestationsResult] = await Promise.allSettled([
      listPartnerApiKeys(signal),
      listPartnerAttestations(signal),
    ])

    if (signal?.aborted) {
      return false
    }

    const unauthorizedError = [keysResult, attestationsResult].find(
      (result) =>
        result.status === "rejected" &&
        result.reason instanceof PartnerUnauthorizedError,
    )

    if (unauthorizedError) {
      setAuthedPartner(null)
      setAuthMessage("Your partner session expired. Sign in again.")
      setKeysLoading(false)
      setAttestationsLoading(false)
      return false
    }

    const nextErrors: string[] = []

    if (keysResult.status === "fulfilled") {
      setKeys(keysResult.value)
    } else {
      nextErrors.push("Unable to load API keys.")
    }

    if (attestationsResult.status === "fulfilled") {
      const nextAttestations = sortAttestations(attestationsResult.value)
      setAttestations(nextAttestations)
      setSelectedAttestationId((currentId) =>
        resolveSelectedAttestationId(nextAttestations, currentId),
      )
    } else {
      nextErrors.push("Unable to load partner attestations.")
    }

    setWorkspaceError(nextErrors.join(" "))
    setKeysLoading(false)
    setAttestationsLoading(false)

    return nextErrors.length === 0
  }

  const syncSession = useEffectEvent(async (search: string, signal: AbortSignal) => {
    setBooting(true)

    const params = new URLSearchParams(search)
    const oauthMessage = getOAuthErrorMessage(params.get("error"))
    setAuthMessage(oauthMessage)

    try {
      const providers = await getPartnerAuthProviders(signal)
      if (signal.aborted) {
        return
      }

      setAuthProviders(providers)

      try {
        const session = await getPartnerSession(signal)
        if (signal.aborted) {
          return
        }

        setPartner(session.partner)

        if (session.partner.status === "active") {
          await loadWorkspaceData(signal)
        } else {
          resetWorkspaceState()
        }
      } catch (error) {
        if (signal.aborted) {
          return
        }

        if (error instanceof PartnerUnauthorizedError) {
          setAuthedPartner(null)
        } else {
          setAuthedPartner(null)
          setAuthMessage(
            error instanceof Error
              ? error.message
              : "Unable to restore the partner session.",
          )
        }
      }
    } catch (error) {
      if (signal.aborted) {
        return
      }

      setAuthedPartner(null)
      setAuthProviders(EMPTY_AUTH_PROVIDERS)
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "Unable to load partner auth providers.",
      )
    } finally {
      if (!signal.aborted) {
        setBooting(false)
      }
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    void syncSession(location.search, controller.signal)
    return () => controller.abort()
  }, [location.search])

  useEffect(() => () => cancelPublishFlowRun(), [])

  useEffect(() => {
    if (requestedWorkspaceView) {
      startTransition(() =>
        setWorkspaceView((current) =>
          current === requestedWorkspaceView ? current : requestedWorkspaceView,
        ),
      )
      return
    }

    navigate(getPartnerDashboardPath("home"), { replace: true })
  }, [navigate, requestedWorkspaceView])

  useEffect(() => {
    if (partner?.status !== "active") {
      return
    }

    if (location.pathname !== getPartnerDashboardPath("home")) {
      consumePartnerDashboardReturnPath()
      return
    }

    const rememberedPath = consumePartnerDashboardReturnPath()
    if (!rememberedPath || rememberedPath === location.pathname) {
      return
    }

    if (!getPartnerDashboardView(rememberedPath)) {
      return
    }

    navigate(rememberedPath, { replace: true })
  }, [location.pathname, navigate, partner?.status])

  async function handleSharedKeyLogin(
    username: string,
    key: string,
  ): Promise<void> {
    setAuthBusy(true)
    setAuthMessage("")

    try {
      const session = await loginWithSharedKey(username, key)
      setPartner(session.partner)

      if (session.partner.status === "active") {
        await loadWorkspaceData()
      } else {
        resetWorkspaceState()
      }

      toast.success("Signed in to the dashboard")
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "Unable to sign in with shared key.",
      )
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleLogout(): Promise<void> {
    cancelPublishFlowRun()

    try {
      await logoutPartner()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to clear session.",
      )
    } finally {
      setAuthedPartner(null)
      setAuthMessage("")
      toast.success("Signed out")
    }
  }

  async function refreshKeysBestEffort(successContext: string): Promise<void> {
    try {
      const nextKeys = await listPartnerApiKeys()
      setKeys(nextKeys)
    } catch (error) {
      console.error(`Unable to refresh API keys after ${successContext}.`, error)
      toast.error(`${successContext}, but the key list could not be refreshed.`)
    }
  }

  function cancelPublishFlowRun(): void {
    publishFlowRunIdRef.current += 1
    publishFlowAbortControllerRef.current?.abort()
    publishFlowAbortControllerRef.current = null
  }

  function beginPublishFlowRun(): { runId: number; signal: AbortSignal } {
    cancelPublishFlowRun()

    const controller = new AbortController()
    publishFlowAbortControllerRef.current = controller

    return {
      runId: publishFlowRunIdRef.current,
      signal: controller.signal,
    }
  }

  function isCurrentPublishFlowRun(runId: number): boolean {
    return publishFlowRunIdRef.current === runId
  }

  function finishPublishFlowRun(runId: number): void {
    if (!isCurrentPublishFlowRun(runId)) {
      return
    }

    publishFlowAbortControllerRef.current = null
  }

  function assertActivePublishFlowRun(runId: number, signal: AbortSignal): void {
    if (!signal.aborted && isCurrentPublishFlowRun(runId)) {
      return
    }

    throw createAbortError()
  }

  async function handleRefreshWorkspace(): Promise<void> {
    setRefreshBusy(true)

    try {
      const success = await loadWorkspaceData()
      if (success) {
        toast.success("Dashboard data refreshed")
      } else {
        toast.error("Dashboard data refreshed with issues")
      }
    } finally {
      setRefreshBusy(false)
    }
  }

  async function handleCreateKey(
    input: PartnerCreateKeyInput,
  ): Promise<PartnerCreateKeyResponse> {
    const response = await createPartnerApiKey(input)
    await refreshKeysBestEffort("API key created")
    return response
  }

  async function handleRotateKey(id: string): Promise<PartnerRotateKeyResponse> {
    const response = await rotatePartnerApiKey(id)
    await refreshKeysBestEffort("API key rotated")
    return response
  }

  async function handleRevokeKey(id: string): Promise<void> {
    await revokePartnerApiKey(id)
    await refreshKeysBestEffort("API key revoked")
  }

  function upsertAttestationRecord(nextAttestation: PartnerAttestationSummary): void {
    setAttestations((current) => upsertAttestation(current, nextAttestation))
    setSelectedAttestationId(nextAttestation.id)
  }

  async function handleRefreshAttestation(id: string): Promise<void> {
    try {
      const nextAttestation = await refreshPartnerAttestation(id)
      upsertAttestationRecord(nextAttestation)
      setBadgeDefaultsOpen(false)
      toast.success("Attestation refreshed to the newest report")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to refresh attestation.",
      )
    }
  }

  async function handleRevokeAttestation(id: string): Promise<void> {
    try {
      const nextAttestation = await revokePartnerAttestation(id)
      upsertAttestationRecord(nextAttestation)
      navigateToWorkspace("attestations")
      setBadgeDefaultsOpen(false)
      setDetailSheetOpen(false)
      toast.success("Public attestation revoked")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to revoke attestation.",
      )
    }
  }

  async function handleUpdateBadgeConfig(
    id: string,
    input: PartnerAttestationBadgeConfigInput,
  ): Promise<void> {
    setBadgeConfigBusyId(id)

    try {
      const nextAttestation = await updatePartnerAttestationBadgeConfig(id, input)
      upsertAttestationRecord(nextAttestation)
      toast.success("Badge settings updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update badge design.",
      )
    } finally {
      setBadgeConfigBusyId((current) => (current === id ? null : current))
    }
  }

  async function handleUpdateAttestationMetadata(
    id: string,
    input: PartnerAttestationMetadataInput,
  ): Promise<void> {
    setMetadataBusyId(id)

    try {
      const nextAttestation = await updatePartnerAttestationMetadata(id, input)
      upsertAttestationRecord(nextAttestation)
      toast.success("Draft metadata updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update draft metadata.",
      )
    } finally {
      setMetadataBusyId((current) => (current === id ? null : current))
    }
  }

  async function handleDeleteAttestationDraft(id: string): Promise<void> {
    setDraftDeleteBusyId(id)

    try {
      await deletePartnerAttestationDraft(id)
      let nextAttestations: PartnerAttestationSummary[] = []
      setAttestations((current) => {
        nextAttestations = current.filter((attestation) => attestation.id !== id)
        return nextAttestations
      })
      setSelectedAttestationId((currentId) =>
        currentId === id ? resolveSelectedAttestationId(nextAttestations, null) : currentId,
      )
      setDetailSheetOpen(false)
      setBadgeDefaultsOpen(false)
      setPublishFlow((current) =>
        current.attestationId === id ? initialPublishFlow() : current,
      )
      toast.success("Draft attestation deleted")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete draft attestation.",
      )
    } finally {
      setDraftDeleteBusyId((current) => (current === id ? null : current))
    }
  }

  async function handleUpdatePartnerBadgePreferences(
    input: PartnerBadgePreferencesInput,
  ): Promise<void> {
    setPartnerBadgePreferencesBusy(true)

    try {
      const nextPartner = await updatePartnerBadgePreferences(input)
      setPartner(nextPartner)
      toast.success("Default badge settings updated")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update default badge settings.",
      )
    } finally {
      setPartnerBadgePreferencesBusy(false)
    }
  }

  async function handlePublishAttestation(): Promise<void> {
    const attestationId = selectedAttestation?.id ?? publishFlow.attestationId ?? null

    if (!attestationId) {
      setPublishError("Select or create a draft attestation before publishing.")
      return
    }

    setPublishError("")
    setPublishFlow((current) => ({
      ...current,
      stage: "publishing",
      message: "Publishing the selected attestation...",
    }))

    try {
      const nextAttestation = await publishPartnerAttestation(attestationId)
      upsertAttestationRecord(nextAttestation)
      navigateToWorkspace("attestations")
      setBadgeDefaultsOpen(false)
      setDetailSheetOpen(true)
      setPublishFlow((current) => ({
        ...current,
        stage: "ready",
        attestationId: nextAttestation.id,
        message: "Attestation published and ready to share.",
      }))
      toast.success("Attestation published")
    } catch (error) {
      setPublishFlow((current) => ({
        ...current,
        stage: "ready",
      }))
      setPublishError(
        error instanceof Error ? error.message : "Unable to publish attestation.",
      )
    }
  }

  async function handleScanArtifact(): Promise<void> {
    if (!publishFile) {
      setPublishError("Choose a DLL or EXE before starting the scan.")
      return
    }
    if (!publishForm.artifactKey.trim()) {
      setPublishError("Artifact key is required before creating the draft.")
      return
    }

    const file = publishFile
    const { runId, signal } = beginPublishFlowRun()

    setPublishError("")
      setPublishFlow({
        stage: "uploading",
        message: "Inspecting your assembly and uploading your file...",
        attestationId: null,
        submissionId: null,
        reportId: null,
      })

      try {
      const publishMetadata = await inspectPublishAssembly(file, runId, signal)
      assertActivePublishFlowRun(runId, signal)

      const submissionId = await uploadSubmission(
        file,
        toAttestationUploadMetadata(publishMetadata),
        signal,
      )
      assertActivePublishFlowRun(runId, signal)

      setPublishFlow({
        stage: "polling",
        message: "Upload complete. Finalizing scan results...",
        attestationId: null,
        submissionId,
        reportId: null,
      })

      const report = await waitForCompletedReport(submissionId, runId, signal)
      assertActivePublishFlowRun(runId, signal)

      const nextDraft = await createPartnerAttestationDraft({
        submissionId,
        artifactKey: publishForm.artifactKey,
        artifactVersion: publishForm.artifactVersion.trim() || (publishMetadata.artifactVersion ?? ""),
        publicDisplayName: publishForm.publicDisplayName.trim() || fileStem(file.name),
        canonicalSourceUrl: publishForm.canonicalSourceUrl,
      })
      assertActivePublishFlowRun(runId, signal)

      upsertAttestationRecord(nextDraft)
      setPublishFile(null)
      setPublishForm(initialPublishForm())
      navigateToWorkspace("attestations")
      setBadgeDefaultsOpen(false)
      setDetailSheetOpen(true)

      setPublishFlow({
        stage: "ready",
        message: "Draft attestation created and added to the ledger.",
        attestationId: nextDraft.id,
        submissionId,
        reportId: report.reportId,
      })

      toast.success("Draft attestation created")
    } catch (error) {
      if (isAbortError(error) || !isCurrentPublishFlowRun(runId)) {
        return
      }

      setPublishFlow(initialPublishFlow())
      setPublishError(
        error instanceof Error ? error.message : "Unable to complete the scan.",
      )
    } finally {
      finishPublishFlowRun(runId)
    }
  }

  async function waitForCompletedReport(
    submissionId: string,
    runId: number,
    signal: AbortSignal,
  ): Promise<Awaited<ReturnType<typeof getPartnerReport>>> {
    const startedAt = Date.now()
    let lastStatus = "pending"

    while (Date.now() - startedAt < REPORT_POLL_TIMEOUT_MS) {
      assertActivePublishFlowRun(runId, signal)

      try {
        const report = await getPartnerReport(submissionId, signal)
        assertActivePublishFlowRun(runId, signal)

        if (report.status === "completed") {
          return report
        }

        if (report.status === "failed") {
          throw new Error(report.error || "The scan report failed.")
        }

        lastStatus = report.status
        setPublishFlow((current) => ({
          ...current,
          stage: "polling",
          reportId: report.reportId,
          message:
            report.status === "processing"
              ? "We're scanning your file..."
              : "Waiting for scan results...",
        }))
      } catch (error) {
        if (
          isTransientMissingReportError(error) &&
          Date.now() - startedAt < REPORT_POLL_TIMEOUT_MS
        ) {
          setPublishFlow((current) => ({
            ...current,
            stage: "polling",
            message: "Preparing your submission...",
          }))
          await sleep(REPORT_POLL_INTERVAL_MS, signal)
          continue
        }

        throw error
      }

      await sleep(REPORT_POLL_INTERVAL_MS, signal)
    }

      throw new Error(
        `Timed out waiting for the scan report after the last known status "${lastStatus}".`,
      )
    }

  async function inspectPublishAssembly(
    file: File,
    runId: number,
    signal: AbortSignal,
  ): Promise<ReturnType<typeof buildAttestationPublishMetadata>> {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      assertActivePublishFlowRun(runId, signal)

      const result = await scanAssembly(bytes, file.name)
      assertActivePublishFlowRun(runId, signal)

      return buildAttestationPublishMetadata(result)
    } catch (error) {
      console.warn("Unable to inspect publish assembly metadata before upload.", error)
      return {
        loaderType: null,
        artifactVersion: null,
      }
    }
  }

  function handlePublishFileChange(file: File | null): void {
    setPublishFile(file)
    setPublishError("")
    if (!file) {
      return
    }

    const nextStem = fileStem(file.name)
    setPublishForm((current) => ({
      ...current,
      artifactKey:
        current.artifactKey.trim().length > 0
          ? current.artifactKey
          : nextStem.toLowerCase().replace(/[^a-z0-9._/-]+/g, "-"),
      publicDisplayName:
        current.publicDisplayName.trim().length > 0 ? current.publicDisplayName : nextStem,
    }))
  }

  function handleResetPublishFlow(): void {
    cancelPublishFlowRun()
    setPublishForm(initialPublishForm())
    setPublishFlow(initialPublishFlow())
    setPublishFile(null)
    setPublishError("")
  }

  function handlePublishFormChange(
    field: PublishTextField,
    value: string,
  ): void {
    setPublishForm((current) => ({
      ...current,
      [field]: value,
    }))
    setPublishError("")
  }

  function handleSelectAttestation(attestation: PartnerAttestationSummary): void {
    setSelectedAttestationId(attestation.id)
    setBadgeDefaultsOpen(false)
    setDetailSheetOpen(true)
  }

  function handleReviewAttestation(attestation: PartnerAttestationSummary): void {
    setSelectedAttestationId(attestation.id)
    navigateToWorkspace("attestations")
    setBadgeDefaultsOpen(false)
    setDetailSheetOpen(true)
  }

  function handleBeginDiscordLogin(path: string): void {
    rememberPartnerDashboardReturnPath(location.pathname)
    window.location.assign(buildPartnerAuthUrl(path))
  }

  function handleCopySnippet(text: string, successMessage: string): void {
    void copyTextToClipboard(text).then((copied) => {
      if (copied) {
        toast.success(successMessage)
      } else {
        toast.error("Unable to copy to clipboard")
      }
    })
  }

  function handleOpenLink(url: string): void {
    if (typeof window === "undefined") {
      return
    }

    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (booting) {
    return <LoadingShell />
  }

  if (!partner) {
    return (
      <PartnerAuthScreen
        authProviders={authProviders}
        loading={authBusy}
        errorMessage={authMessage}
        onBeginDiscordLogin={() => handleBeginDiscordLogin("/partner/auth/discord")}
        onBeginDevDiscordLogin={() => handleBeginDiscordLogin("/partner/auth/dev-login")}
        onSharedKeyLogin={handleSharedKeyLogin}
      />
    )
  }

  if (partner.status === "suspended") {
    return <PartnerStatusScreen partner={partner} onLogout={handleLogout} />
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-full">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950/95 lg:flex lg:flex-col">
          <PartnerSidebarNav
            partner={partner}
            workspaceView={workspaceView}
            attestationsCount={attestations.length}
            publishedCount={publishedCount}
            draftCount={draftCount}
            supersededCount={supersededCount}
            activeKeyCount={activeKeyCount}
            onSelectWorkspace={handleSelectWorkspace}
            onOpenProfile={handleOpenProfileSheet}
          />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="size-4" />
                <span className="sr-only">Open workspace navigation</span>
              </Button>
              <div className="min-w-0">
                <p className="truncate text-[0.64rem] uppercase tracking-[0.18em] text-slate-500">
                  Partner dashboard
                </p>
                <h1 className="truncate text-lg font-semibold text-white">{activeWorkspace.label}</h1>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {partner.tierRestriction === "partner" ? (
                <Badge
                  variant="outline"
                  className="h-7 border-emerald-600/30 border bg-emerald-950/40 px-2.5 text-[0.72rem] text-emerald-300"
                >
                  <ShieldCheck data-icon="inline-start" className="mr-1 size-3" />
                  Partner
                </Badge>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                disabled={refreshBusy}
                onClick={handleRefreshWorkspace}
              >
                <RefreshCcw
                  data-icon="inline-start"
                  className={cn("size-3.5", refreshBusy && "animate-spin")}
                />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                onClick={handleLogout}
              >
                <LogOut data-icon="inline-start" className="size-3.5" />
              </Button>
            </div>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6">
              {workspaceError ? (
                <div className="rounded-xl border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                  {workspaceError}
                </div>
              ) : null}

              <section className="min-w-0">
                {workspaceView === "home" ? (
                  <DashboardHome
                    partner={partner}
                    attestations={attestations}
                    publishedCount={publishedCount}
                    draftCount={draftCount}
                    supersededCount={supersededCount}
                    activeKeyCount={activeKeyCount}
                    onSelectWorkspace={handleSelectWorkspace}
                    onReviewAttestation={handleReviewAttestation}
                  />
                ) : null}

                {workspaceView === "publish" ? (
                  <PublishWorkspace
                    publishFile={publishFile}
                    publishForm={publishForm}
                    publishFlow={publishFlow}
                    publishError={publishError}
                    onPublishFileChange={handlePublishFileChange}
                    onPublishFormChange={handlePublishFormChange}
                    onReset={handleResetPublishFlow}
                    onScan={handleScanArtifact}
                  />
                ) : null}

                {workspaceView === "attestations" ? (
                  <div className="space-y-5">
                    {badgeDefaultsOpen ? (
                      <DashboardBadgeDefaultsPanel
                        partner={partner}
                        payload={badgePreviewPayload}
                        busy={partnerBadgePreferencesBusy}
                        onBack={handleCloseBadgeDefaults}
                        onSave={(value) => void handleUpdatePartnerBadgePreferences(value)}
                      />
                    ) : detailSheetOpen && !shouldUseMobileDetailSheet() && selectedAttestation ? (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                          <div className="min-w-0">
                            <p className="dashboard-kicker">Attestation management</p>
                            <p className="mt-1 truncate text-sm font-medium text-white">
                              {selectedAttestation.publicDisplayName}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-slate-700 border bg-slate-900 text-slate-200 hover:bg-slate-800"
                            onClick={handleCloseAttestationDetail}
                          >
                            <ChevronLeft data-icon="inline-start" className="size-4" />
                            Back to ledger
                          </Button>
                        </div>

                        <DashboardDetailPanel
                          key={buildDetailPanelKey(selectedAttestation)}
                          attestation={selectedAttestation}
                          shareOutputs={shareOutputs}
                          onPublish={handlePublishAttestation}
                          onRefresh={handleRefreshAttestation}
                          onRevoke={handleRevokeAttestation}
                          onDeleteDraft={handleDeleteAttestationDraft}
                          onMetadataChange={handleUpdateAttestationMetadata}
                          onBadgeConfigChange={handleUpdateBadgeConfig}
                          onOpenLink={handleOpenLink}
                          onCopySnippet={handleCopySnippet}
                          publishBusy={publishFlow.stage === "publishing"}
                          metadataBusy={metadataBusyId === selectedAttestation.id}
                          deleteBusy={draftDeleteBusyId === selectedAttestation.id}
                          badgeConfigBusy={badgeConfigBusyId === selectedAttestation.id}
                          publishOutcomeLabel={getPublishOutcomeLabel(attestations, selectedAttestation)}
                        />
                      </div>
                    ) : (
                      <AttestationLedger
                        attestations={attestations}
                        selectedAttestationId={selectedAttestationId}
                        isLoading={attestationsLoading}
                        errorMessage=""
                        onSelect={handleSelectAttestation}
                        onReview={handleReviewAttestation}
                        onRefresh={handleRefreshAttestation}
                        onRevoke={handleRevokeAttestation}
                        onDeleteDraft={handleDeleteAttestationDraft}
                        onOpenLink={handleOpenLink}
                        onCopySnippet={handleCopySnippet}
                        onOpenDetails={() => setDetailSheetOpen(true)}
                        onOpenBadgeDefaults={handleOpenBadgeDefaults}
                      />
                    )}
                  </div>
                ) : null}

                {workspaceView === "access" ? (
                  <ApiKeysPanel
                    keys={keys}
                    partner={partner}
                    isLoading={keysLoading}
                    onCreateKey={handleCreateKey}
                    onRotateKey={handleRotateKey}
                    onRevokeKey={handleRevokeKey}
                  />
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r border-slate-800 bg-slate-950 p-0 text-white sm:max-w-none lg:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>Switch between dashboard surfaces.</SheetDescription>
          </SheetHeader>
          <PartnerSidebarNav
            partner={partner}
            workspaceView={workspaceView}
            attestationsCount={attestations.length}
            publishedCount={publishedCount}
            draftCount={draftCount}
            supersededCount={supersededCount}
            activeKeyCount={activeKeyCount}
            onSelectWorkspace={handleSelectWorkspace}
            onOpenProfile={handleOpenProfileSheet}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen}>
        <SheetContent
          side="right"
          className="w-full border-l border-slate-800 bg-slate-950 p-0 text-white sm:max-w-md"
        >
          <SheetHeader className="border-b border-slate-800 px-6 py-5 text-left">
            <SheetTitle className="text-lg font-semibold text-white">Partner account</SheetTitle>
            <SheetDescription className="text-sm text-slate-400">
              Account status, tier, and partner workspace limits.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <Avatar className="size-12 border border-slate-700">
                <AvatarFallback className="bg-slate-900 text-sm font-semibold text-slate-200">
                  {getInitials(partner.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{partner.name}</p>
                <p className="truncate text-sm text-slate-400">{partner.email}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <ProfileFact label="Status" value={partner.status} />
              <ProfileFact
                label="Tier"
                value={partner.tierRestriction === "partner" ? "Partner" : "Free"}
              />
              <ProfileFact label="Key limit" value={`${partner.maxKeys} total keys`} />
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="border-slate-700 border bg-slate-900 text-slate-200 hover:bg-slate-800"
                onClick={() => setProfileSheetOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={detailSheetOpen && shouldUseMobileDetailSheet()} onOpenChange={setDetailSheetOpen}>
        <SheetContent
          side="right"
          className="w-full border-l border-slate-800 bg-slate-950 p-0 text-white sm:max-w-md xl:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Manage attestation</SheetTitle>
            <SheetDescription>
              Review, publish, refresh, revoke, and share the selected attestation.
            </SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto p-4">
            <DashboardDetailPanel
              key={selectedAttestation ? buildDetailPanelKey(selectedAttestation) : "empty-detail"}
              attestation={selectedAttestation}
              shareOutputs={shareOutputs}
              onPublish={handlePublishAttestation}
              onRefresh={handleRefreshAttestation}
              onRevoke={handleRevokeAttestation}
              onDeleteDraft={handleDeleteAttestationDraft}
              onMetadataChange={handleUpdateAttestationMetadata}
              onBadgeConfigChange={handleUpdateBadgeConfig}
              onOpenLink={handleOpenLink}
              onCopySnippet={handleCopySnippet}
              publishBusy={publishFlow.stage === "publishing"}
              metadataBusy={selectedAttestation ? metadataBusyId === selectedAttestation.id : false}
              deleteBusy={selectedAttestation ? draftDeleteBusyId === selectedAttestation.id : false}
              badgeConfigBusy={selectedAttestation ? badgeConfigBusyId === selectedAttestation.id : false}
              publishOutcomeLabel={selectedAttestation ? getPublishOutcomeLabel(attestations, selectedAttestation) : null}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface PartnerSidebarNavProps {
  partner: PartnerProfile
  workspaceView: PartnerWorkspaceView
  attestationsCount: number
  publishedCount: number
  draftCount: number
  supersededCount: number
  activeKeyCount: number
  onSelectWorkspace: (value: PartnerWorkspaceView) => void
  onOpenProfile: () => void
}

function PartnerSidebarNav({
  partner,
  workspaceView,
  attestationsCount,
  publishedCount,
  draftCount,
  supersededCount,
  activeKeyCount,
  onSelectWorkspace,
  onOpenProfile,
}: PartnerSidebarNavProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <img
          src={`${import.meta.env.BASE_URL}icon.png`}
          alt="MLVScan"
          className="h-10 w-10 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">MLVScan Dashboard</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          <section>
            <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workspace
            </p>
            <div className="mt-3 space-y-1">
              {workspaceItems.map((item) => {
                const Icon = item.icon
                const isActive = workspaceView === item.value

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onSelectWorkspace(item.value)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition",
                      "hover:bg-slate-900 hover:text-white",
                      isActive && "bg-slate-900 text-white",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.value === "attestations" && attestationsCount > 0 ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        {attestationsCount}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="border-t border-slate-800 pt-6">
            <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Session
            </p>
            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Current</span>
                <span className="font-semibold text-white">{publishedCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Drafts</span>
                <span className="font-semibold text-white">{draftCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Superseded</span>
                <span className="font-semibold text-white">{supersededCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">Active keys</span>
                <span className="font-semibold text-white">{activeKeyCount}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-left transition hover:border-slate-700 hover:bg-slate-900"
        >
          <Avatar className="size-10 border border-slate-700">
            <AvatarFallback className="bg-slate-900 text-xs font-semibold text-slate-200">
              {getInitials(partner.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{partner.name}</p>
            <p className="truncate text-xs text-slate-500">{partner.email}</p>
          </div>
        </button>
      </div>
    </div>
  )
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}

function LoadingShell() {
  return (
    <div className="dashboard-shell flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-700 border-t-primary" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  )
}

function initialPublishFlow(): PublishFlowState {
  return {
    stage: "idle",
    message: "",
    attestationId: null,
    submissionId: null,
    reportId: null,
  }
}

function initialPublishForm(): PublishFormState {
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
  }
}

function createAbortError(): DOMException {
  return new DOMException("The operation was aborted.", "AbortError")
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  )
}

function isTransientMissingReportError(error: unknown): boolean {
  return (
    error instanceof PartnerNotFoundError ||
    (error instanceof Error && /404/.test(error.message))
  )
}

function sleep(durationMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError())
  }

  return new Promise((resolve, reject) => {
    if (!signal) {
      window.setTimeout(resolve, durationMs)
      return
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort)
      resolve()
    }, durationMs)

    function handleAbort(): void {
      window.clearTimeout(timeoutId)
      reject(createAbortError())
    }

    signal.addEventListener("abort", handleAbort, { once: true })
  })
}

function rememberPartnerDashboardReturnPath(pathname: string): void {
  if (typeof window === "undefined") {
    return
  }

  if (!getPartnerDashboardView(pathname)) {
    return
  }

  window.sessionStorage.setItem(PARTNER_DASHBOARD_RETURN_PATH_KEY, pathname)
}

function consumePartnerDashboardReturnPath(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const rememberedPath =
    window.sessionStorage.getItem(PARTNER_DASHBOARD_RETURN_PATH_KEY)

  if (!rememberedPath) {
    return null
  }

  window.sessionStorage.removeItem(PARTNER_DASHBOARD_RETURN_PATH_KEY)
  return rememberedPath
}

function getOAuthErrorMessage(errorCode: string | null): string {
  switch (errorCode) {
    case "discord_denied":
      return "Discord sign-in was canceled before the Worker could issue a session."
    case "discord_failed":
      return "Discord sign-in failed. Retry the OAuth flow."
    case "signup_failed":
      return "Discord sign-in succeeded, but the Worker could not create the partner record."
    case "suspended":
      return "This account is suspended. Internal operators must reactivate it from the admin workflow."
    case "account_too_new":
      return "The Discord account does not meet the minimum account-age requirement."
    case "mfa_required":
      return "Multi-factor authentication is required before Discord sign-in is allowed."
    default:
      return ""
  }
}

function fileStem(fileName: string): string {
  const stem = fileName.replace(/\.[^/.]+$/, "")
  return stem || fileName
}

function sortAttestations(
  attestations: PartnerAttestationSummary[],
): PartnerAttestationSummary[] {
  return [...attestations].sort((left, right) => {
    const leftTime = Date.parse(
      left.refreshedAt ?? left.publishedAt ?? left.createdAt,
    )
    const rightTime = Date.parse(
      right.refreshedAt ?? right.publishedAt ?? right.createdAt,
    )
    return rightTime - leftTime
  })
}

function resolveSelectedAttestationId(
  attestations: PartnerAttestationSummary[],
  currentId: string | null,
): string | null {
  if (currentId && attestations.some((attestation) => attestation.id === currentId)) {
    return currentId
  }

  return attestations[0]?.id ?? null
}

function getPublishOutcomeLabel(
  attestations: PartnerAttestationSummary[],
  attestation: PartnerAttestationSummary | null,
): string | null {
  if (!attestation || attestation.publicationStatus !== "draft") {
    return null
  }

  const current = findCurrentAttestationForArtifactKey(
    attestations,
    attestation.artifactKey,
    attestation.id,
  )

  return current
    ? `Replace current attestation for ${attestation.artifactKey}.`
    : `Publish new current attestation for ${attestation.artifactKey}.`
}

function buildDetailPanelKey(attestation: PartnerAttestationSummary): string {
  return [
    attestation.id,
    attestation.artifactKey,
    attestation.artifactVersion ?? "",
    attestation.publicDisplayName,
    attestation.canonicalSourceUrl ?? "",
  ].join(":")
}

function buildBadgePreviewPayload(
  attestation: PartnerAttestationSummary | null,
): PublicAttestationPayload {
  if (attestation) {
    return attestation
  }

  return {
    shareId: "att_preview",
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
    activeReportId: "report-preview",
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
}

function buildShareOutputs(
  attestation: PartnerAttestationSummary | null,
): ShareOutputs | null {
  if (!attestation || !isCurrentAttestation(attestation)) {
    return null
  }

  return {
    markdown: `[![MLVScan badge](${attestation.badgeUrl})](${attestation.publicUrl})`,
    bbcode: `[url=${attestation.publicUrl}][img]${attestation.badgeUrl}[/img][/url]`,
  }
}

function upsertAttestation(
  attestations: PartnerAttestationSummary[],
  nextAttestation: PartnerAttestationSummary,
): PartnerAttestationSummary[] {
  return sortAttestations([
    nextAttestation,
    ...attestations.filter((attestation) => attestation.id !== nextAttestation.id),
  ])
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "PD"
  )
}

