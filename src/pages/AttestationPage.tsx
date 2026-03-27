import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { LoaderCircle, ShieldQuestion, TriangleAlert } from "lucide-react"

import PublicAttestationReport from "@/components/attestations/PublicAttestationReport"
import {
  PublicAttestationNotFoundError,
  fetchPublicAttestation,
} from "@/lib/attestation-api"
import type { PublicAttestationPayload } from "@/types/attestation"

type PageState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: PublicAttestationPayload }

export default function AttestationPage() {
  const { shareId } = useParams()
  const [state, setState] = useState<PageState>(
    shareId ? { status: "loading" } : { status: "not-found" },
  )

  useEffect(() => {
    if (!shareId) {
      return
    }

    const controller = new AbortController()

    fetchPublicAttestation(shareId, controller.signal)
      .then((payload) => {
        setState({ status: "ready", payload })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        if (error instanceof PublicAttestationNotFoundError) {
          setState({ status: "not-found" })
          return
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load attestation",
        })
      })

    return () => controller.abort()
  }, [shareId])

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {state.status === "loading" && (
          <StatePanel
            icon={<LoaderCircle className="h-10 w-10 animate-spin text-primary" />}
            eyebrow="Loading attestation"
            title="Fetching the current public evidence"
            description="MLVScan is loading the latest published attestation for these exact bytes."
          />
        )}

        {state.status === "not-found" && (
          <StatePanel
            icon={<ShieldQuestion className="h-10 w-10 text-slate-300" />}
            eyebrow="Not found"
            title="This public attestation does not exist"
            description="The share id may be wrong, the attestation may still be private, or it may never have been published."
          />
        )}

        {state.status === "error" && (
          <StatePanel
            icon={<TriangleAlert className="h-10 w-10 text-amber-300" />}
            eyebrow="Load error"
            title="The attestation could not be loaded"
            description={state.message}
          />
        )}

        {state.status === "ready" && <PublicAttestationReport payload={state.payload} />}
      </div>
    </div>
  )
}

function StatePanel({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-800 bg-slate-900/80 px-6 py-10 text-center sm:px-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
        {icon}
      </div>
      <p className="mt-5 text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-3 font-display text-2xl text-white sm:text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 flex justify-center">
        <Link
          to="/scan"
          className="inline-flex min-h-9 items-center rounded-md border border-slate-700 bg-slate-800 px-5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Open local browser scanner
        </Link>
      </div>
    </section>
  )
}
