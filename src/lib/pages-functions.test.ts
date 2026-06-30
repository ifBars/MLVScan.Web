import { describe, expect, it, vi } from "vitest"

import { onRequest } from "../../functions/[[path]]"

describe("Cloudflare Pages catch-all function", () => {
  it("serves the SPA index for public attestation page deep links", async () => {
    const fetchAsset = vi
      .fn()
      .mockResolvedValueOnce(new Response("missing", { status: 404 }))
      .mockResolvedValueOnce(new Response("index", { status: 200 }))

    const response = await onRequest({
      request: new Request("https://mlvscan.com/attestations/att_test", {
        headers: { Accept: "text/html" },
      }),
      env: { ASSETS: { fetch: fetchAsset } },
    })

    expect(response.status).toBe(200)
    expect(fetchAsset).toHaveBeenCalledTimes(2)
    expect(new URL(fetchAsset.mock.calls[1][0].url).pathname).toBe("/")
  })

  it("does not serve SPA HTML for missing static asset paths", async () => {
    const fetchAsset = vi.fn().mockResolvedValueOnce(new Response("missing", { status: 404 }))

    const response = await onRequest({
      request: new Request("https://mlvscan.com/icon.png", {
        headers: { Accept: "text/html,image/avif,image/webp,*/*" },
      }),
      env: { ASSETS: { fetch: fetchAsset } },
    })

    expect(response.status).toBe(404)
    expect(fetchAsset).toHaveBeenCalledTimes(1)
  })
})
