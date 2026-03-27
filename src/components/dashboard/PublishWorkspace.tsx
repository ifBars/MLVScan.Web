import { useId, useRef } from "react"
import { Sparkles, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getFilesSizeLimitBytes } from "@/lib/partner-dashboard-api"
import { formatBytes } from "@/lib/utils"
import type { PublishFlowState } from "@/types/partner-dashboard"

interface PublishWorkspaceProps {
  publishFile: File | null
  publishFlow: PublishFlowState
  publishError: string
  onPublishFileChange: (file: File | null) => void
  onReset: () => void
  onScan: () => Promise<void>
}

export default function PublishWorkspace({
  publishFile,
  publishFlow,
  publishError,
  onPublishFileChange,
  onReset,
  onScan,
}: PublishWorkspaceProps) {
  const limitLabel = formatBytes(getFilesSizeLimitBytes())
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scanBusy = publishFlow.stage === "uploading" || publishFlow.stage === "polling"

  return (
    <Card className="partner-pane overflow-hidden border border-slate-800/80 bg-slate-950/55 shadow-none">
      <CardHeader className="partner-pane-header flex flex-col gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
            Draft submission
          </Badge>
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            Upload and attest
          </p>
        </div>
        <CardTitle className="font-display text-[1.8rem] leading-tight text-white">
          Submit a mod for attestation
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6 text-slate-400">
          Upload the DLL or EXE that should back the badge. MLVScan will scan it, reuse an exact
          existing record when possible, and create an attestation in the ledger for review.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-5 py-5 sm:px-6">
        <div className="group flex flex-col gap-4 rounded-lg border border-dashed border-slate-700 bg-slate-800/40 px-5 py-5 transition hover:border-primary/40 hover:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
              <UploadCloud className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-white">Choose DLL or EXE</p>
              <p className="text-sm text-slate-400">
                Files up to {limitLabel} upload directly. Larger files use the extended upload
                flow.
              </p>
            </div>
          </div>
          <input
            id={fileInputId}
            accept=".dll,.exe"
            ref={fileInputRef}
            className="sr-only"
            disabled={scanBusy}
            type="file"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null
              onPublishFileChange(nextFile)
              event.target.value = ""
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              disabled={scanBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </Button>
            <p id={`${fileInputId}-hint`} className="text-xs leading-5 text-slate-500">
              Keyboard accessible file picker for DLL and EXE uploads.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-sm text-slate-300">
            {publishFile
              ? `${publishFile.name} - ${formatBytes(publishFile.size)}`
              : "No file selected yet."}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-4">
          <p className="dashboard-kicker">Flow status</p>
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
          <Button disabled={!publishFile || scanBusy} onClick={onScan}>
            <Sparkles data-icon="inline-start" />
            {scanBusy ? "Scanning..." : "Create attestation"}
          </Button>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            onClick={onReset}
          >
            {scanBusy ? "Cancel scan" : "Reset flow"}
          </Button>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-4 text-sm leading-6 text-slate-400">
          Drafts are created here and then managed from the ledger. Publish, refresh, revoke, and
          share actions all happen from the attestation management sheet.
        </div>
      </CardContent>
    </Card>
  )
}
