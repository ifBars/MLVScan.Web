import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ShieldAlert, RefreshCw } from "lucide-react"
import type { ScanResult, ScanStatus } from "@/types/mlvscan"
import { scanAssembly } from "@/lib/scanner"
import ScanReport from "@/components/results/ScanReport"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const ScanUploader = () => {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".dll") &&
      !selectedFile.name.toLowerCase().endsWith(".exe") &&
      !selectedFile.name.toLowerCase().endsWith(".di") &&
      !selectedFile.name.toLowerCase().endsWith(".netmodule")) {
      setError("Please upload a .NET assembly (.dll, .exe, or .netmodule)")
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 50MB limit")
      return
    }

    setStatus("uploading")
    setError(null)
    setProgress(0)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const fileBytes = new Uint8Array(arrayBuffer)

      let uploadProgress = 0
      const uploadInterval = setInterval(() => {
        uploadProgress += 10
        setProgress(Math.min(uploadProgress, 90))
        if (uploadProgress >= 100) {
          clearInterval(uploadInterval)
        }
      }, 50)

      setStatus("scanning")
      setProgress(0)

      const scanResult = await scanAssembly(fileBytes, selectedFile.name)

      setResult(scanResult)
      setStatus("complete")
      setProgress(100)
    } catch (err) {
      console.error("Scan error:", err)
      setError(err instanceof Error ? err.message : "Failed to scan file. Please try again.")
      setStatus("error")
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
    setResult(null)
    setError(null)
  }

  return (
    <section id="scan" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Scan Your Mods
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload a .dll file for instant security analysis directly in your browser
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
                  accept=".dll,.exe,.di,.netmodule"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-teal-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Drop your .dll file here
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Maximum file size: 50MB
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
                  Uploading...
                </h3>
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-[shimmer_2s_infinite] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}%
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
                  Deep IL analysis in progress...
                </p>
                <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-6 overflow-hidden">
                  <div
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
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Scan Failed
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {error}
                </p>
                <Button variant="outline" onClick={resetScan}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "complete" && result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <ScanReport result={result} onReset={resetScan} />
          </div>
        )}
      </div>
    </section>
  )
}

export default ScanUploader
