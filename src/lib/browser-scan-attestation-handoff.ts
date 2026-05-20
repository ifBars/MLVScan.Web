const DB_NAME = "mlvscan-browser-scan-attestation"
const DB_VERSION = 1
const STORE_NAME = "handoffs"
const LATEST_HANDOFF_KEY = "latest"
const MAX_HANDOFF_AGE_MS = 30 * 60 * 1000

export interface BrowserScanAttestationHandoff {
  file: File
  source: "browser-scan"
}

interface StoredBrowserScanAttestationHandoff extends BrowserScanAttestationHandoff {
  id: typeof LATEST_HANDOFF_KEY
  createdAt: number
}

export async function saveBrowserScanAttestationHandoff(file: File): Promise<void> {
  const database = await openHandoffDatabase()

  await runStoreRequest(database, "readwrite", (store) =>
    store.put({
      id: LATEST_HANDOFF_KEY,
      file,
      source: "browser-scan",
      createdAt: Date.now(),
    } satisfies StoredBrowserScanAttestationHandoff),
  )

  database.close()
}

export async function consumeBrowserScanAttestationHandoff(): Promise<BrowserScanAttestationHandoff | null> {
  const database = await openHandoffDatabase()
  const stored = await runStoreRequest<StoredBrowserScanAttestationHandoff | undefined>(
    database,
    "readwrite",
    (store) => store.get(LATEST_HANDOFF_KEY),
  )

  await runStoreRequest(database, "readwrite", (store) => store.delete(LATEST_HANDOFF_KEY))
  database.close()

  if (!stored || !(stored.file instanceof File) || stored.source !== "browser-scan") {
    return null
  }

  if (Date.now() - stored.createdAt > MAX_HANDOFF_AGE_MS) {
    return null
  }

  return {
    file: stored.file,
    source: stored.source,
  }
}

async function openHandoffDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    throw new Error("Browser storage is unavailable.")
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Unable to open browser scan handoff storage."))
  })
}

async function runStoreRequest<T = unknown>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = createRequest(transaction.objectStore(STORE_NAME))

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("Browser scan handoff storage request failed."))
    transaction.onerror = () => reject(transaction.error ?? new Error("Browser scan handoff transaction failed."))
  })
}
