import { Ban, Clock3, LogOut } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PartnerProfile } from "@/types/partner-dashboard"

interface PartnerStatusScreenProps {
  partner: PartnerProfile
  onLogout: () => Promise<void>
}

export default function PartnerStatusScreen({
  partner,
  onLogout,
}: PartnerStatusScreenProps) {
  const isPending = partner.status === "pending"

  return (
    <div className="dashboard-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center">
        <Card className="dashboard-panel w-full border-slate-800 bg-slate-900/80">
          <CardHeader className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit border-slate-700 bg-slate-800 text-slate-300">
              Account status
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                {isPending ? (
                  <Clock3 className="h-5 w-5 text-amber-300" />
                ) : (
                  <Ban className="h-5 w-5 text-rose-300" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="font-display text-2xl text-white">
                  {isPending ? "Dashboard access pending" : "Dashboard access suspended"}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-400">
                  {isPending
                    ? "Your account is waiting for operator approval before it can publish attestations or issue partner API keys."
                    : "This account is currently suspended. Partner publishing and API key access remain blocked until the API reactivates it."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-5 py-4">
              <p className="dashboard-kicker">Signed in as</p>
              <p className="mt-2 text-base font-medium text-white">{partner.name}</p>
              <p className="mt-1 text-sm text-slate-400">{partner.email}</p>
            </div>

            {partner.requestedTier ? (
              <div className="rounded-lg border border-cyan-600/30 bg-cyan-950/50 px-5 py-4 text-sm text-cyan-200">
                Requested tier: <span className="font-medium">{partner.requestedTier}</span>
              </div>
            ) : null}

            <div className="rounded-lg border border-slate-800 bg-slate-800/60 px-5 py-4 text-sm leading-6 text-slate-400">
              {isPending
                ? "If this is a new Discord account, an operator can activate it in the admin dashboard after review."
                : "If this suspension looks wrong, review the account state in the API-admin workflow rather than trying to bypass it from the client."}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" onClick={onLogout}>
                Log out
                <LogOut data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
