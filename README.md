# MLVScan.Web

**MLVScan.Web** is a privacy-first web application for scanning Unity mods for malware. Built with **React** and **Vite**, it runs [MLVScan.Core](https://github.com/ifBars/MLVScan.Core) directly in the browser through **WebAssembly**.

## Live Demo

[Launch Scanner](https://mlvscan.com)

## Key Features

* **100% Client-Side**: Files are analyzed in your browser and are never uploaded to a server.
* **Privacy-First**: Your files stay on your device, with no server uploads or tracking.
* **Fast and Modern**: Built with React and Vite for quick loads and a responsive UI.
* **Offline Ready**: Installable as a PWA so you can scan without an active connection.
* **Shared Detection Engine**: Uses the same scanning engine and threat-detection model as the rest of the MLVScan ecosystem.

## Quick Start

### Prerequisites

* **Node.js** 18+
* **Bun**

### Development

```bash
git clone https://github.com/ifBars/MLVScan.Web.git
cd MLVScan.Web
bun install
bun run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
bun run build
```

Outputs to `dist/`.

## Tech Stack

* **Frontend**: React 19 + React Router v7
* **Build Tool**: Vite
* **Styling**: Tailwind CSS v4
* **WASM Engine**: [@mlvscan/wasm-core](https://www.npmjs.com/package/@mlvscan/wasm-core)
* **UI Components**: Radix UI + custom components
* **Animations**: Framer Motion
* **Testing**: Vitest + Testing Library

## WASM Integration

This project uses `@mlvscan/wasm-core` for browser-based scanning:

```bash
bun add @mlvscan/wasm-core
```

The package provides the browser runtime and shared scan-result types used by the web app.

The current scan-result schema is also available at `https://mlvscan.com/schemas/scan-result/1.2.0/schema.json`.

## Documentation

* **Detection Rules**: See [MLVScan.Core Wiki](https://github.com/ifBars/MLVScan.Core/wiki/Detection-Rules)
* **Architecture**: See [MLVScan Wiki](https://github.com/ifBars/MLVScan/wiki/Architecture)
* **WASM Package**: [@mlvscan/wasm-core on npm](https://www.npmjs.com/package/@mlvscan/wasm-core)

---
*Licensed under GPL-3.0*
