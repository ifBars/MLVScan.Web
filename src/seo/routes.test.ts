import { allDocs } from "@/docs/registry"

import { getDocSeoPage, getHomeSeoPage } from "./routes"

describe("SEO routes", () => {
  it("keeps FAQ schema on the homepage", () => {
    const page = getHomeSeoPage()

    expect(page.schema?.some((entry) => entry["@type"] === "FAQPage")).toBe(true)
  })

  it("does not emit FAQ schema for the Unity mod antivirus doc page", () => {
    const unityDoc = allDocs.find((doc) => doc.id === "unity-mod-antivirus")

    expect(unityDoc).toBeDefined()

    const page = getDocSeoPage(unityDoc!)

    expect(page.schema?.some((entry) => entry["@type"] === "FAQPage")).toBe(false)
    expect(page.faqs).toBeUndefined()
  })
})
