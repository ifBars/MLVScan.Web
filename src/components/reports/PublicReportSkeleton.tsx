function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-800/80 ${className}`} />
}

export function PublicReportSkeleton() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PublicReportSkeletonArticle />
      </div>
    </div>
  )
}

export function PublicReportSkeletonArticle() {
  return (
    <article
      className="mx-auto max-w-6xl space-y-6"
      aria-busy="true"
      aria-label="Loading public scan report"
    >
      <section className="min-h-[21rem] rounded-lg border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <SkeletonBlock className="size-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="mt-4 h-10 w-full max-w-2xl" />
              <SkeletonBlock className="mt-4 h-5 w-full max-w-3xl" />
              <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
              <SkeletonBlock className="mt-2 h-4 w-4/5 max-w-xl" />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-9 w-24" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["disposition", "blocking", "findings", "scanned"].map((item) => (
            <div key={item} className="min-h-[4.75rem] rounded-md border border-slate-800 bg-slate-950/60 p-3">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-[22rem] rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <SkeletonBlock className="h-6 w-24" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-start justify-between gap-3">
                <SkeletonBlock className="h-4 w-20 shrink-0" />
                <SkeletonBlock className="h-4 w-1/2" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="mt-5 h-16 w-full" />
        </div>

        <div className="min-h-[22rem] rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="mt-3 h-4 w-full max-w-md" />
            </div>
            <SkeletonBlock className="h-8 w-28 shrink-0" />
          </div>
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="min-h-[6.25rem] rounded-md border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <SkeletonBlock className="h-5 w-16" />
                  <SkeletonBlock className="h-4 w-36" />
                </div>
                <SkeletonBlock className="mt-4 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
