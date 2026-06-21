import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ShieldAlert, RefreshCw, FileWarning } from "lucide-react"
import type { ScanResult, ScanStatus } from "@/types/mlvscan"
import { scanAssemblyInWorker, type ScanProgress } from "@/lib/scanner"
import { combineScanResults } from "@/lib/scan-result-aggregation"
import { isSupportedAssemblyFileName, resolveUploadFiles } from "@/lib/upload-file"
import { getPartnerDashboardPath } from "@/lib/partner-dashboard-routes"
import { saveBrowserScanAttestationHandoff } from "@/lib/browser-scan-attestation-handoff"
import ScanReport from "@/components/results/ScanReport"

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const INITIAL_SCAN_PROGRESS = 1
const OVERALL_PROGRESS_CAP = 99
const MIN_VISIBLE_COMPLETED_ASSEMBLY_PROGRESS = 90
type UploadErrorKind = "invalid-file" | "file-size" | "scan"

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve())
      return
    }

    setTimeout(resolve, 0)
  })

const toFileBlobPart = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const combineOverallProgress = (completed: number, total: number, currentProgress: number): number => {
  if (total <= 0) {
    return 0
  }

  const completedPortion = completed / total
  const currentPortion = (Math.min(100, Math.max(0, currentProgress)) / 100) / total
  return Math.min(OVERALL_PROGRESS_CAP, Math.round((completedPortion + currentPortion) * 100))
}

const getScanPhaseLabel = (phase: string): string => {
  switch (phase) {
    case "ReadAssembly":
      return "Reading assembly..."
    case "ScanMetadata":
      return "Inspecting metadata..."
    case "ScanImports":
      return "Checking native imports..."
    case "ScanType":
      return "Scanning types..."
    case "AnalyzeMethodDataFlow":
      return "Tracing method dataflow..."
    case "AnalyzeCrossMethodDataFlow":
      return "Tracing cross-method dataflow..."
    case "PostAnalysisRefine":
      return "Running post-analysis rules..."
    case "BuildCallChainFindings":
      return "Building call chains..."
    case "BuildDataFlowFindings":
      return "Building dataflow findings..."
    case "CorrelateFindings":
      return "Correlating findings..."
    default:
      return "Deep IL analysis in progress..."
  }
}

const ScanUploader = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [scanTotal, setScanTotal] = useState(0)
  const [scanCompleted, setScanCompleted] = useState(0)
  const [currentScanName, setCurrentScanName] = useState<string | null>(null)
  const [scanPhase, setScanPhase] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [attestationFile, setAttestationFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<UploadErrorKind>("scan")
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!isSupportedAssemblyFileName(selectedFile.name) && !selectedFile.name.toLowerCase().endsWith(".zip")) {
      setError("Please upload a .NET assembly (.dll, .exe, or .netmodule) or a .zip archive containing one")
      setErrorKind("invalid-file")
      setStatus("error")
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`${selectedFile.name} is ${formatFileSize(selectedFile.size)}. Browser scans support files up to ${formatFileSize(MAX_FILE_SIZE)}.`)
      setErrorKind("file-size")
      setStatus("error")
      return
    }

    setStatus("uploading")
    setError(null)
    setErrorKind("scan")
    setProgress(0)
    setScanTotal(0)
    setScanCompleted(0)
    setCurrentScanName(null)
    setScanPhase(null)

    try {
      const resolvedUploads = await resolveUploadFiles(selectedFile, MAX_FILE_SIZE)

      setStatus("scanning")
      setProgress(INITIAL_SCAN_PROGRESS)
      setScanTotal(resolvedUploads.length)
      setScanCompleted(0)
      await yieldToBrowser()

      const scanResults = []
      for (const [index, resolvedUpload] of resolvedUploads.entries()) {
        setCurrentScanName(resolvedUpload.fileName)
        setScanPhase(null)
        await yieldToBrowser()

        const scanResult = await scanAssemblyInWorker(
          resolvedUpload.fileBytes,
          resolvedUpload.fileName,
          (scanProgress: ScanProgress) => {
            const nextProgress = combineOverallProgress(index, resolvedUploads.length, scanProgress.percentage)
            setScanPhase(getScanPhaseLabel(scanProgress.phase))
            setCurrentScanName(scanProgress.currentItem || resolvedUpload.fileName)
            setProgress((currentProgress) => Math.max(currentProgress, nextProgress))
          }
        )

        const completedAssemblyProgress = combineOverallProgress(
          index,
          resolvedUploads.length,
          MIN_VISIBLE_COMPLETED_ASSEMBLY_PROGRESS
        )
        setProgress((currentProgress) => Math.max(currentProgress, completedAssemblyProgress))
        await yieldToBrowser()

        scanResults.push(scanResult)
        const completed = index + 1
        setScanCompleted(completed)
        setProgress(Math.round((completed / resolvedUploads.length) * 100))
      }
      const scanResult = combineScanResults(selectedFile.name, scanResults)

      setResult(scanResult)
      setAttestationFile(resolvedUploads.length === 1
        ? new File([toFileBlobPart(resolvedUploads[0].fileBytes)], resolvedUploads[0].fileName, {
          type: "application/octet-stream",
          lastModified: selectedFile.lastModified,
        })
        : null)
      setStatus("complete")
      setProgress(100)
      setCurrentScanName(null)
      setScanPhase(null)
    } catch (err) {
      console.error("Scan error:", err)
      setError(err instanceof Error ? err.message : "Failed to scan file. Please try again.")
      setErrorKind("scan")
      setStatus("error")
      setCurrentScanName(null)
      setScanPhase(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  const resetScan = () => {
    setStatus("idle")
    setProgress(0)
    setScanTotal(0)
    setScanCompleted(0)
    setCurrentScanName(null)
    setScanPhase(null)
    setResult(null)
    setAttestationFile(null)
    setError(null)
    setErrorKind("scan")
  }

  const handleCreateAttestation = async () => {
    if (!attestationFile) {
      return
    }

    try {
      await saveBrowserScanAttestationHandoff(attestationFile)
    } catch (error) {
      console.warn("Unable to persist browser scan file for login handoff.", error)
    }

    navigate(getPartnerDashboardPath("publish"), {
      state: {
        source: "browser-scan",
        publishFile: attestationFile,
      },
    })
  }

  return (
    <section id="scan" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Scan Your Mods
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload a .dll or .zip file for instant security analysis directly in your browser
          </p>
        </div>

        {status === "idle" && (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
            <CardContent className="pt-8 pb-8">
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
                  ? "border-teal-400 bg-emerald-950/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700"
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".dll,.exe,.di,.netmodule,.zip"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-teal-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Drop your assembly or .zip archive here
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or click to browse for a .dll, .exe, .netmodule, or .zip
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Maximum file size: 100MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "uploading" && (
          <Card className="border-2 border-dashed border-teal-400/30 bg-emerald-950/10">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Preparing File
                </h3>
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full w-1/3 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-[shimmer_2s_infinite] rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reading and unpacking locally...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "scanning" && (
          <Card className="border-2 border-dashed border-cyan-400/30 bg-emerald-950/10">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-cyan-300 border-r-teal-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">
                  Analyzing Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {scanTotal > 1
                    ? `Scanning assembly ${Math.min(scanCompleted + 1, scanTotal)} of ${scanTotal}`
                    : scanPhase ?? "Deep IL analysis in progress..."}
                </p>
                {currentScanName && (
                  <p className="mt-1 max-w-md truncate text-xs text-gray-500 dark:text-gray-500">
                    {currentScanName}
                  </p>
                )}
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-6 overflow-hidden">
                  <div
                    data-testid="scan-progress-fill"
                    className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-[shimmer_1.5s_infinite] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-teal-300 mt-2">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card className={`border-2 ${
            errorKind === "file-size"
              ? "border-amber-300 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-950/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
          }`}>
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  errorKind === "file-size"
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  {errorKind === "file-size" ? (
                    <FileWarning className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  errorKind === "file-size"
                    ? "text-amber-900 dark:text-amber-100"
                    : "text-red-900 dark:text-red-100"
                }`}>
                  {errorKind === "file-size"
                    ? "File Too Large"
                    : errorKind === "invalid-file"
                      ? "Unsupported File"
                      : "Scan Failed"}
                </h3>
                <p className={`max-w-md text-center text-sm mb-4 ${
                  errorKind === "file-size"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {error}
                </p>
                {errorKind === "file-size" && (
                  <p className="mb-4 text-center text-xs text-amber-700/80 dark:text-amber-200/80">
                    Choose a smaller assembly or scan the file locally with MLVScan.DevCLI.
                  </p>
                )}
                <Button variant="outline" onClick={resetScan}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "complete" && result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ScanReport
              result={result}
              onReset={resetScan}
              onCreateAttestation={attestationFile ? handleCreateAttestation : undefined}
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default ScanUploader
