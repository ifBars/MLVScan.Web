# MLVScan.Web

**MLVScan.Web** is a modern, privacy-first web application for scanning Unity mods for malware. Built with **React** and **Vite**, it runs [MLVScan.Core](https://github.com/ifBars/MLVScan.Core) entirely in your browser using **WebAssembly**.

## 🌍 Live Demo

[Launch Scanner](https://mlvscan.com)

## ✨ Key Features

*   **100% Client-Side**: Files are analyzed in your browser, **never uploaded** to a server.
*   **Privacy-First**: Your files never leave your device—no server uploads, no tracking.
*   **Fast & Modern**: Built with React and Vite for instant loading and smooth UI.
*   **Offline Ready**: Installable as a PWA—scan anytime, anywhere without internet.
*   **Same Scanning Engine**: Uses the exact same 17+ detection rules as the [MLVScan](https://github.com/ifBars/MLVScan) plugin (MelonLoader/BepInEx).

## 🚀 Quick Start

### Prerequisites

*   **Node.js** 18+ and npm/pnpm
*   Optional: **npm** login if working with private WASM packages

### Development

```bash
git clone https://github.com/ifBars/MLVScan.Web.git
cd MLVScan.Web
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Outputs to `dist/`.

## 🏗️ Tech Stack

*   **Frontend**: React 19 + React Router v7
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4
*   **WASM Engine**: [@mlvscan/wasm-core](https://www.npmjs.com/package/@mlvscan/wasm-core)
*   **UI Components**: Radix UI + custom components
*   **Animations**: Framer Motion
*   **Testing**: Vitest + Testing Library

## 📦 WASM Integration

This project uses `@mlvscan/wasm-core` npm package for the malware scanning engine:

```bash
npm install @mlvscan/wasm-core
```

The WASM core is automatically bundled and available at runtime. For development tips on the WASM package, see [MLVScan.Core/MLVScan.WASM](https://github.com/ifBars/MLVScan.Core/tree/main/MLVScan.WASM).

## 📚 Documentation

*   **Detection Rules**: See [MLVScan.Core Wiki](https://github.com/ifBars/MLVScan.Core/wiki/Detection-Rules).
*   **Architecture**: See [MLVScan Wiki](https://github.com/ifBars/MLVScan/wiki/Architecture).
*   **WASM Package**: [MLVScan.Core WASM npm](https://www.npmjs.com/package/@mlvscan/wasm-core).

---
*Licensed under GPL-3.0*