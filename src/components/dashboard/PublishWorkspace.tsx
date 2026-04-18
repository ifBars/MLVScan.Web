import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { Sparkles, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFilesSizeLimitBytes } from "@/lib/partner-dashboard-api"
import { formatBytes } from "@/lib/utils"
import type { PublishFlowState, PublishFormState } from "@/types/partner-dashboard"

type PublishWorkspaceTextField =
  | "publicDisplayName"
  | "artifactKey"
  | "artifactVersion"
  | "canonicalSourceUrl"

interface PublishWorkspaceProps {
  publishFile: File | null
  publishForm: PublishFormState
  publishFlow: PublishFlowState
  publishError: string
  onPublishFileChange: (file: File | null) => void
  onPublishFormChange: (field: PublishWorkspaceTextField, value: string) => void
  onReset: () => void
  onScan: () => Promise<void>
}

export default function PublishWorkspace({
  publishFile,
  publishForm,
  publishFlow,
  publishError,
  onPublishFileChange,
  onPublishFormChange,
  onReset,
  onScan,
}: PublishWorkspaceProps) {
  const limitLabel = formatBytes(getFilesSizeLimitBytes())
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const scanBusy = publishFlow.stage === "uploading" || publishFlow.stage === "polling"
  const artifactKeyReady = publishForm.artifactKey.trim().length > 0

  const handleSelectedFile = useCallback(
    (file: File | null) => {
      if (scanBusy) {
        return
      }

      onPublishFileChange(file)
    },
    [onPublishFileChange, scanBusy],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setDragActive(false)

      handleSelectedFile(event.dataTransfer.files?.[0] ?? null)
    },
    [handleSelectedFile],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!scanBusy) {
      setDragActive(true)
    }
  }, [scanBusy])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
  }, [])

  const handleUploaderKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (scanBusy) {
        return
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        fileInputRef.current?.click()
      }
    },
    [scanBusy],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
          Upload and attest
        </p>
        <h2 className="font-display text-[1.8rem] leading-tight text-white">
          Submit a mod for attestation
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <div
          className={`relative overflow-hidden rounded-lg border border-dashed transition ${
            dragActive
              ? "border-primary/60 bg-primary/8"
              : "border-slate-700 bg-slate-900/45 hover:border-primary/40 hover:bg-slate-900/65"
          } ${scanBusy ? "opacity-70" : ""}`}
          role="button"
          tabIndex={scanBusy ? -1 : 0}
          aria-describedby={`${fileInputId}-help`}
          onClick={() => {
            if (!scanBusy) {
              fileInputRef.current?.click()
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={handleUploaderKeyDown}
        >
          <input
            id={fileInputId}
            accept=".dll"
            ref={fileInputRef}
            className="sr-only"
            disabled={scanBusy}
            type="file"
            onChange={(event) => {
              handleSelectedFile(event.target.files?.[0] ?? null)
              event.target.value = ""
            }}
          />
          <div className="flex flex-col items-center gap-5 px-6 py-9 text-center sm:px-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">
                Drop your .NET mod DLL here
              </p>
              <p id={`${fileInputId}-help`} className="mx-auto max-w-2xl text-sm leading-6 text-slate-400">
                Drag a file into the workspace or browse to choose one, then set the artifact key,
                display name, version, and source URL below. Keep one stable artifact key per mod
                or package lineage so replacement publishes stay predictable. Files up to{" "}
                {limitLabel} start uploading right away. Larger files are supported with one extra
                step.
              </p>
            </div>
            <p className="text-xs text-slate-500">Accepted files: `.dll` MelonLoader or BepInEx assemblies</p>
            <div className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              {publishFile
                ? `${publishFile.name} - ${formatBytes(publishFile.size)}`
                : "No file selected yet."}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <FieldBlock
            label="Artifact key"
            description="Stable partner-scoped lineage key used when this draft becomes the current attestation."
            required
          >
            <Input
              value={publishForm.artifactKey}
              disabled={scanBusy}
              placeholder="console-for-all"
              className="border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              onChange={(event) => onPublishFormChange("artifactKey", event.target.value)}
            />
          </FieldBlock>

          <FieldBlock
            label="Display name"
            description="Human-readable name shown in the ledger and public attestation."
          >
            <Input
              value={publishForm.publicDisplayName}
              disabled={scanBusy}
              placeholder="ConsoleForAll"
              className="border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              onChange={(event) => onPublishFormChange("publicDisplayName", event.target.value)}
            />
          </FieldBlock>

          <FieldBlock
            label="Version"
            description="Optional publisher version label. MLVScan auto-fills detected assembly metadata when available, and you can override it here."
          >
            <Input
              value={publishForm.artifactVersion}
              disabled={scanBusy}
              placeholder="1.0.0"
              className="border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              onChange={(event) => onPublishFormChange("artifactVersion", event.target.value)}
            />
          </FieldBlock>

          <FieldBlock
            label="Canonical source URL"
            description="Optional download or package page MLVScan should associate with this attestation."
          >
            <Input
              value={publishForm.canonicalSourceUrl}
              disabled={scanBusy}
              placeholder="https://thunderstore.io/..."
              className="border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              onChange={(event) => onPublishFormChange("canonicalSourceUrl", event.target.value)}
            />
          </FieldBlock>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-4">
          <p className="dashboard-kicker">Submission status</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {publishFlow.message || "No scan is currently running."}
          </p>
          {publishFlow.submissionId ? (
            <p className="mt-2 break-all font-mono text-xs text-slate-500">
              Submission: {publishFlow.submissionId}
            </p>
          ) : null}
        </div>

        {publishError ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
            {publishError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button disabled={!publishFile || !artifactKeyReady || scanBusy} onClick={onScan}>
            <Sparkles data-icon="inline-start" />
            {scanBusy ? "Scanning..." : "Create attestation"}
          </Button>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            onClick={onReset}
          >
            {scanBusy ? "Cancel scan" : "Start over"}
          </Button>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-4 text-sm leading-6 text-slate-400">
          Drafts are created here, then tuned and published from the ledger. You can still adjust
          key, version, name, source URL, and badge settings on the draft before it becomes public.
        </div>
      </div>
    </div>
  )
}

function FieldBlock({
  label,
  description,
  required = false,
  children,
}: {
  label: string
  description: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/55 px-4 py-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-white">{label}</p>
        {required ? (
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-primary">Required</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}
