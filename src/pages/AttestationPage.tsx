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
  const [state, setState] = useState<PageState>({ status: "loading" })

  useEffect(() => {
    if (!shareId) {
      setState({ status: "not-found" })
      return
    }

    const controller = new AbortController()
    setState({ status: "loading" })

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
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-black/25 px-6 py-12 text-center shadow-2xl shadow-black/30 sm:px-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/4">
        {icon}
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
      <h1 className="mt-4 font-display text-3xl text-white sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
      <div className="mt-8 flex justify-center">
        <Link
          to="/scan"
          className="inline-flex min-h-10 items-center rounded-full border border-white/12 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Open local browser scanner
        </Link>
      </div>
    </section>
  )
}
