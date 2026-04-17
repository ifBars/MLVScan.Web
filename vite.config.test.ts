import { describe, expect, it } from "vitest"

import { buildPartnerApiProxy } from "./vite.config"

describe("buildPartnerApiProxy", () => {
  it("routes account and partner dashboard calls through the partner API target", () => {
    const proxy = buildPartnerApiProxy("http://localhost:8787")

    expect(proxy["/account"]).toMatchObject({
      target: "http://localhost:8787",
      changeOrigin: true,
    })
    expect(proxy["/partner"]).toMatchObject({
      target: "http://localhost:8787",
      changeOrigin: true,
    })
    expect(proxy["/public/attestations"]).toMatchObject({
      target: "http://localhost:8787",
      changeOrigin: true,
    })
  })

  it("rewrites public badge requests to the public attestation badge endpoint", () => {
    const proxy = buildPartnerApiProxy("http://localhost:8787")
    const rewrite = proxy["^/attestations/[^/]+/badge\\.svg$"]?.rewrite

    expect(rewrite?.("/attestations/att_test/badge.svg")).toBe("/public/attestations/att_test/badge.svg")
  })
})
