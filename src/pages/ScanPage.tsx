import ScanUploader from "@/components/scan/ScanUploader"

const ScanPage = () => {
    return (
        <div className="pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                        Browser-Based Analysis
                    </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Securely scan your .NET assemblies for malicious behavior without uploading them to any server. All processing happens locally in your browser using WebAssembly.
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <ScanUploader />
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
                            <p className="text-sm text-gray-400">Your files never leave your computer. The scanner runs entirely within your browser's memory.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Deep Analysis</h3>
                            <p className="text-sm text-gray-400">Advanced IL inspection detects obfuscation, credential theft, and harmful network connections.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 transition-colors">
                            <h3 className="text-lg font-semibold text-white mb-2">Open Source</h3>
                            <p className="text-sm text-gray-400">Transparent engine powered by MLVScan.Core. Verify the code yourself on GitHub.</p>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default ScanPage
