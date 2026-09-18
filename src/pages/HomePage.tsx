import FAQ from "@/components/FAQ"
import Features from "@/components/Features"
import Hero from "@/components/layout/Hero"
import Seo from "@/components/seo/Seo"
import TrustSection from "@/components/TrustSection"
import { getHomeSeoPage } from "@/seo/routes"

export default function HomePage() {
  return (
    <>
      <Seo page={getHomeSeoPage()} />
      <Hero />
      <Features />
      <TrustSection />
      <FAQ />
    </>
  )
}
