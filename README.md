# MLVScanWeb

**MLVScanWeb** is a privacy-first, browser-based malware scanner for Unity mods. It runs [MLVScan.Core](../MLVScan.Core) entirely in your browser using **WebAssembly** (Blazor).

## 🌍 Live Demo

[Launch Scanner](https://mlvscan.yourdomain.com) *(Demo Link)*

## ✨ Key Features

*   **100% Client-Side**: Files are analyzed in your browser, **never uploaded** to a server.
*   **Offline Capable**: Install as a PWA to scan without internet.
*   **Same Engine**: Uses the exact same 17+ detection rules as the MelonLoader plugin.

## 🛠️ Run Locally

```bash
git clone https://github.com/ifBars/MLVScanWeb.git
cd MLVScanWeb
dotnet run
# Open https://localhost:5001
```

## 📚 Documentation

*   **Detection Rules**: See [MLVScan.Core Wiki](https://github.com/ifBars/MLVScan.Core/wiki/Detection-Rules).
*   **Architecture**: See [MLVScan Wiki](https://github.com/ifBars/MLVScan/wiki/Architecture).

---
*Licensed under GPL-3.0*
