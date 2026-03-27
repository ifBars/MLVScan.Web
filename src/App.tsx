import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/layout/Hero"
import ScanPage from "@/pages/ScanPage"
import AttestationPage from "@/pages/AttestationPage"
import Footer from "@/components/layout/Footer"
import Features from "@/components/Features"
import TrustSection from "@/components/TrustSection"
import DocsLayout from "@/components/docs/DocsLayout"
import DocsPage from "@/pages/DocsPage"
import AdvisoriesPage from "@/pages/AdvisoriesPage"
import ThreatFamiliesPage from "@/pages/ThreatFamiliesPage"
import { AdvisoriesLayout } from "@/components/advisories/AdvisoriesLayout"
import ParticleBackground from "@/components/layout/ParticleBackground"
import { allDocs } from "@/docs/registry"

import InspectorPage from "@/pages/InspectorPage"
import PartnerDashboardPage from "@/pages/PartnerDashboardPage"
import { Toaster } from "@/components/ui/sonner"

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <TrustSection />
    </>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  )
}

function MarketingShell() {
  return (
    <div className="min-h-screen bg-transparent">
      <ParticleBackground />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <>
        <Routes>
          <Route path="/dashboard/*" element={<PartnerDashboardPage />} />
          <Route element={<MarketingShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/attestations/:shareId" element={<AttestationPage />} />
            <Route path="/inspector" element={<InspectorPage />} />
            <Route path="/docs" element={
              <Suspense fallback={<LoadingSpinner />}>
                <DocsLayout />
              </Suspense>
            }>
              {allDocs.map((doc) => (
                doc.slug === '' ? 
                  <Route key={doc.id} index element={<DocsPage doc={doc} />} /> :
                  <Route key={doc.id} path={doc.slug} element={<DocsPage doc={doc} />} />
              ))}
              <Route path="*" element={<Navigate to="/docs" replace />} />
            </Route>
            <Route path="/advisories" element={<AdvisoriesLayout />}>
              <Route index element={<AdvisoriesPage />} />
              <Route path="families" element={<ThreatFamiliesPage />} />
              <Route path="families/:slug" element={<ThreatFamiliesPage />} />
              <Route path=":slug" element={<AdvisoriesPage />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </>
    </BrowserRouter>
  )
}

export default App
