import { useState } from "react"
import {
  ArrowUpRight,
  Copy,
  KeyRound,
  MoreHorizontal,
  Plus,
  RotateCw,
  ShieldAlert,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn, copyTextToClipboard, formatDate } from "@/lib/utils"
import type {
  PartnerApiKey,
  PartnerCreateKeyInput,
  PartnerCreateKeyResponse,
  PartnerProfile,
  PartnerRotateKeyResponse,
} from "@/types/partner-dashboard"

interface ApiKeysPanelProps {
  keys: PartnerApiKey[]
  partner: PartnerProfile
  isLoading: boolean
  onCreateKey: (input: PartnerCreateKeyInput) => Promise<PartnerCreateKeyResponse>
  onRotateKey: (id: string) => Promise<PartnerRotateKeyResponse>
  onRevokeKey: (id: string) => Promise<void>
}

interface RevealedSecretState {
  title: string
  secret: string
  warning: string
}

export default function ApiKeysPanel({
  keys,
  partner,
  isLoading,
  onCreateKey,
  onRotateKey,
  onRevokeKey,
}: ApiKeysPanelProps) {
  const [showInactive, setShowInactive] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [autoCopySecret, setAutoCopySecret] = useState(true)
  const [label, setLabel] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [revealedSecret, setRevealedSecret] = useState<RevealedSecretState | null>(null)
  const [createBusy, setCreateBusy] = useState(false)
  const [busyKeyId, setBusyKeyId] = useState<string | null>(null)
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null)

  const visibleKeys = showInactive ? keys : keys.filter((item) => item.active)
  const canCreateKeys = partner.status === "active"

  async function revealSecret(
    title: string,
    secret: string,
    warning: string,
  ): Promise<void> {
    setRevealedSecret({ title, secret, warning })
    setSecretDialogOpen(true)

    if (!autoCopySecret) {
      return
    }

    const copied = await copyTextToClipboard(secret)
    if (copied) {
      toast.success("Copied plaintext key to clipboard")
    } else {
      toast.error("Key created, but copying to clipboard failed")
    }
  }

  async function handleCreateKey(): Promise<void> {
    setCreateBusy(true)

    try {
      const nextExpiresAt = expiresAt ? new Date(expiresAt).toISOString() : undefined
      const response = await onCreateKey({
        label: label.trim() || undefined,
        tier: partner.tierRestriction,
        expiresAt: nextExpiresAt,
      })

      setCreateDialogOpen(false)
      setLabel("")
      setExpiresAt("")
      await revealSecret("New API key", response.plaintextKey, response.warning)
      toast.success("Partner API key created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create API key")
    } finally {
      setCreateBusy(false)
    }
  }

  async function handleRotateKey(id: string): Promise<void> {
    setBusyKeyId(id)

    try {
      const response = await onRotateKey(id)
      await revealSecret("Rotated API key", response.plaintextKey, response.warning)
      toast.success("Partner API key rotated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rotate API key")
    } finally {
      setBusyKeyId(null)
    }
  }

  async function handleRevokeKey(): Promise<void> {
    if (!revokeKeyId) {
      return
    }

    setBusyKeyId(revokeKeyId)

    try {
      await onRevokeKey(revokeKeyId)
      toast.success("Partner API key revoked")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke API key")
    } finally {
      setBusyKeyId(null)
      setRevokeKeyId(null)
    }
  }

  return (
    <>
      <Card className="partner-pane overflow-hidden border border-slate-800/80 bg-slate-950/55 shadow-none">
        <CardHeader className="partner-pane-header flex flex-col gap-4 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
                API access
              </Badge>
              <CardTitle className="font-display text-[1.65rem] text-white">
                Manage partner API keys
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6 text-slate-400">
                Plaintext key material is only returned on create and rotate. Store it
                immediately, because the API never serves it again after that response. Use these
                keys for CI uploads and attestation automation, then follow the{" "}
                <a
                  href="/docs/ci-attestations"
                  className="text-teal-300 underline-offset-4 hover:text-teal-200 hover:underline"
                >
                  CI attestation guide
                </a>
                {" "}for the GitHub Actions flow.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                onClick={() => window.open("/docs/ci-attestations", "_blank", "noopener,noreferrer")}
              >
                CI attestation guide
                <ArrowUpRight data-icon="inline-end" />
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                onClick={() => window.open("https://api.mlvscan.com/docs", "_blank", "noopener,noreferrer")}
              >
                API docs
                <ArrowUpRight data-icon="inline-end" />
              </Button>
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2">
                <span className="text-sm text-slate-300">Show inactive</span>
                <Switch checked={showInactive} onCheckedChange={setShowInactive} />
              </div>
              <Button disabled={!canCreateKeys} onClick={() => setCreateDialogOpen(true)}>
                <Plus data-icon="inline-start" />
                Create key
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          {!canCreateKeys ? (
            <div className="rounded-lg border border-amber-600/30 bg-amber-950/40 px-4 py-3 text-sm leading-6 text-amber-100">
              API key creation becomes available after the account is approved.
            </div>
          ) : null}

          {isLoading && keys.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-5 text-sm text-slate-400">
              Loading partner API keys...
            </div>
          ) : visibleKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleKeys.map((keyRecord) => {
                  const keyState = resolveKeyState(keyRecord)

                  return (
                    <TableRow
                      key={keyRecord.id}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-white">
                            {keyRecord.label || "Untitled key"}
                          </p>
                          <p className="font-mono text-xs text-slate-500">
                            {keyRecord.prefix}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-slate-700 bg-slate-800 text-slate-300",
                            keyState === "revoked" &&
                              "border-rose-600/40 bg-rose-950/50 text-rose-300",
                          )}
                        >
                          {keyState}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {keyRecord.lastUsedAt ? formatDate(keyRecord.lastUsedAt) : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                              <span className="sr-only">Key actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              disabled={!keyRecord.active || busyKeyId === keyRecord.id}
                              onClick={() => handleRotateKey(keyRecord.id)}
                            >
                              <RotateCw data-icon="inline-start" />
                              Rotate key
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                copyTextToClipboard(keyRecord.prefix).then((copied) => {
                                  if (copied) {
                                    toast.success("Copied key preview")
                                  } else {
                                    toast.error("Failed to copy key preview")
                                  }
                                })
                              }
                            >
                              <Copy data-icon="inline-start" />
                              Copy key preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={!keyRecord.active || busyKeyId === keyRecord.id}
                              onClick={() => setRevokeKeyId(keyRecord.id)}
                            >
                              <Trash2 data-icon="inline-start" />
                              Revoke key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 px-5 py-6 text-sm leading-6 text-slate-400">
              No keys match the current filter. Create one when you need server-side partner API
              access.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="font-display text-xl">Create API key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Keys inherit your account tier automatically. Set an optional expiration and issue
              the key when you are ready. Dashboard-created keys work for CI attestation
              automation in v1 without any extra scope setup.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Label</span>
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Build pipeline key"
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Expiration (optional)
              </span>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3">
              <Checkbox
                checked={autoCopySecret}
                onCheckedChange={(checked) => setAutoCopySecret(Boolean(checked))}
              />
              <span className="text-sm text-slate-300">
                Copy plaintext key to clipboard after it is issued
              </span>
            </label>
          </div>

          <DialogFooter className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={createBusy} onClick={handleCreateKey}>
              <KeyRound data-icon="inline-start" />
              Issue key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={secretDialogOpen}
        onOpenChange={(open) => {
          setSecretDialogOpen(open)
          if (!open) {
            setRevealedSecret(null)
          }
        }}
      >
        <DialogContent className="border-slate-800 bg-slate-900 text-white">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="font-display text-xl">
              {revealedSecret?.title ?? "Issued API key"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Store this key now. The API will not show it again after this dialog closes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Textarea
              readOnly
              value={revealedSecret?.secret ?? ""}
              className="min-h-[140px] border-slate-700 bg-slate-800 font-mono text-xs text-slate-200"
            />
            {revealedSecret?.warning ? (
              <div className="rounded-lg border border-amber-600/30 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
                <ShieldAlert data-icon="inline-start" />
                <span className="ml-2">{revealedSecret.warning}</span>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              onClick={() => setSecretDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!revealedSecret) {
                  return
                }

                const copied = await copyTextToClipboard(revealedSecret.secret)
                if (copied) {
                  toast.success("Copied plaintext key to clipboard")
                } else {
                  toast.error("Failed to copy plaintext key")
                }
              }}
            >
              <Copy data-icon="inline-start" />
              Copy key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={revokeKeyId !== null} onOpenChange={(open) => !open && setRevokeKeyId(null)}>
        <AlertDialogContent className="border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              This key will stop working immediately. If any automation depends on it, rotate the
              key instead of revoking it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeKey}>Revoke key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function resolveKeyState(keyRecord: PartnerApiKey): "active" | "inactive" | "revoked" {
  if (keyRecord.revokedAt) {
    return "revoked"
  }

  if (!keyRecord.active) {
    return "inactive"
  }

  return "active"
}
