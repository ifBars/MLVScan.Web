import { useState } from "react"
import {
  ArrowRight,
  FlaskConical,
  LogIn,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PartnerAuthProviders } from "@/types/partner-dashboard"

interface PartnerAuthScreenProps {
  authProviders: PartnerAuthProviders
  loading: boolean
  errorMessage: string
  onBeginDiscordLogin: () => void
  onBeginDevDiscordLogin: () => void
  onSharedKeyLogin: (username: string, key: string) => Promise<void>
}

export default function PartnerAuthScreen({
  authProviders,
  loading,
  errorMessage,
  onBeginDiscordLogin,
  onBeginDevDiscordLogin,
  onSharedKeyLogin,
}: PartnerAuthScreenProps) {
  const hasDiscordOption =
    authProviders.discordOAuthEnabled || authProviders.devDiscordLoginEnabled

  const [authTab, setAuthTab] = useState<"discord" | "shared">(
    hasDiscordOption ? "discord" : "shared",
  )
  const [sharedKeyUsername, setSharedKeyUsername] = useState("")
  const [sharedKeyValue, setSharedKeyValue] = useState("")

  async function handleSharedKeySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSharedKeyLogin(sharedKeyUsername.trim().toLowerCase(), sharedKeyValue)
  }

  return (
    <div className="dashboard-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="dashboard-panel relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative flex h-full flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h1 className="max-w-2xl font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">
                Publish attestations, manage access, and keep releases moving.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                Sign in to submit new drafts, review attestation history, and manage partner API
                keys from one workspace.
              </p>
            </div>

            <div className="max-w-3xl rounded-2xl border border-slate-800/80 bg-slate-950/45 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Release confidence</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Partner attestations
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-y-3 text-sm leading-6 text-slate-300">
                <FeatureRow
                  title="Submit exact build artifacts"
                  description="Create draft attestations from the DLL or EXE that will back the public record."
                />
                <FeatureRow
                  title="Review before publishing"
                  description="Drafts stay private until you choose the attestation to stand behind publicly."
                />
                <FeatureRow
                  title="Keep access separate"
                  description="Create and rotate partner keys without mixing credential work into the release flow."
                />
              </div>
            </div>
          </div>
        </section>

        <Card className="dashboard-panel flex h-full flex-col border-slate-800 bg-slate-900/80">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                Secure sign-in
              </Badge>
            </div>
            <CardTitle className="font-display text-2xl text-white">
              Access the partner dashboard
            </CardTitle>
            <CardDescription className="max-w-xl text-sm leading-6 text-slate-400">
              Use Discord for partner identity or a shared-key account for team access.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-5">
            {errorMessage ? (
              <div className="rounded-lg border border-rose-600/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            <Tabs
              value={hasDiscordOption ? authTab : "shared"}
              onValueChange={(value) => setAuthTab(value as "discord" | "shared")}
              className="flex flex-1 flex-col gap-4"
            >
              <TabsList className="grid h-auto grid-cols-2 gap-1.5 rounded-lg bg-slate-800 p-1">
                <TabsTrigger
                  value="discord"
                  disabled={!hasDiscordOption}
                  className="rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Discord
                </TabsTrigger>
                <TabsTrigger
                  value="shared"
                  className="rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Shared key
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discord" className="flex-1">
                <div className="flex h-full flex-col gap-4 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
                  <div className="flex flex-col gap-2">
                    <p className="dashboard-kicker">Partner identity</p>
                    <h2 className="font-display text-lg text-white">Use your Discord-backed account</h2>
                    <p className="text-sm leading-6 text-slate-400">
                      Best for individual partner accounts that manage their own publication
                      workflow.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      className="justify-between"
                      disabled={!authProviders.discordOAuthEnabled || loading}
                      onClick={onBeginDiscordLogin}
                    >
                      Sign in with Discord
                      <LogIn data-icon="inline-end" />
                    </Button>

                    {authProviders.devDiscordLoginEnabled ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-between border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                        disabled={loading}
                        onClick={onBeginDevDiscordLogin}
                      >
                        Use local dev account
                        <FlaskConical data-icon="inline-end" />
                      </Button>
                    ) : null}
                  </div>

                  {!hasDiscordOption ? (
                    <div className="rounded-lg border border-amber-600/30 bg-amber-950/50 px-4 py-3 text-sm text-amber-200">
                      Discord sign-in is not configured in this environment. Use a shared-key
                      account instead.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-4 py-3 text-xs text-slate-400">
                      Accounts pending approval can still sign in, but publishing workflows and
                      API key creation stay blocked until access is approved.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="shared" className="flex-1">
                <form
                  onSubmit={handleSharedKeySubmit}
                  className="flex h-full flex-col gap-4 rounded-lg border border-slate-800 bg-slate-800/40 p-4"
                >
                  <div className="flex flex-col gap-2">
                    <p className="dashboard-kicker">Team access</p>
                    <h2 className="font-display text-lg text-white">Shared-key sign in</h2>
                    <p className="text-sm leading-6 text-slate-400">
                      Use this for team accounts that manage attestations across multiple
                      operators.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-300">Username</span>
                      <Input
                        value={sharedKeyUsername}
                        onChange={(event) => setSharedKeyUsername(event.target.value)}
                        autoComplete="username"
                        placeholder="partner-team"
                        className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        disabled={loading}
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-300">Shared key</span>
                      <Input
                        value={sharedKeyValue}
                        onChange={(event) => setSharedKeyValue(event.target.value)}
                        autoComplete="current-password"
                        placeholder="Paste the issued shared key"
                        type="password"
                        className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <Button type="submit" disabled={loading}>
                      Continue to dashboard
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FeatureRow({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}
