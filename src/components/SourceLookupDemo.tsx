import { useEffect, useRef } from "react"

const SourceLookupDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let isVisible = false

    const updatePlayback = () => {
      if (isVisible && !reducedMotion.matches) {
        void video.play().catch(() => undefined)
        return
      }

      video.pause()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        updatePlayback()
      },
      { threshold: 0.35 },
    )

    observer.observe(video)
    reducedMotion.addEventListener("change", updatePlayback)

    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener("change", updatePlayback)
    }
  }, [])

  return (
    <section className="px-4 pt-6 pb-8 sm:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground">
            Check a Schedule 1 mod page in seconds.
          </h2>
          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            For supported mods, replace the Nexus Mods or Thunderstore domain with{" "}
            <span className="font-medium text-teal-300">mlvscan.com</span> to open the latest public report.
          </p>
        </div>

        <figure className="mt-8 min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/50 ring-1 ring-teal-400/10">
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black object-cover"
              controls
              loop
              muted
              playsInline
              preload="metadata"
              poster={`${import.meta.env.BASE_URL}media/source-report-lookup-poster.jpg`}
              aria-label="Demonstration of opening existing MLVScan reports from Nexus Mods and Thunderstore page URLs"
            >
              <source src={`${import.meta.env.BASE_URL}media/source-report-lookup-demo.webm`} type="video/webm" />
              <source src={`${import.meta.env.BASE_URL}media/source-report-lookup-demo.mp4`} type="video/mp4" />
            </video>
          </div>
        </figure>
      </div>
    </section>
  )
}

export default SourceLookupDemo
