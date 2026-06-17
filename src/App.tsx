import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { lazy, Suspense, type ReactNode } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { AdvisoriesLayout } from "@/components/advisories/AdvisoriesLayout"
import ParticleBackground from "@/components/layout/ParticleBackground"
import { PublicReportSkeleton } from "@/components/reports/PublicReportSkeleton"
import { allDocs } from "@/docs/registry"

import { Toaster } from "@/components/ui/sonner"

const HomePage = lazy(() => import("@/pages/HomePage"))
const ScanPage = lazy(() => import("@/pages/ScanPage"))
const AttestationPage = lazy(() => import("@/pages/AttestationPage"))
const PublicReportPage = lazy(() => import("@/pages/PublicReportPage"))
const SourceReportRedirectPage = lazy(() => import("@/pages/SourceReportRedirectPage"))
const InspectorPage = lazy(() => import("@/pages/InspectorPage"))
const PartnerDashboardPage = lazy(() => import("@/pages/PartnerDashboardPage"))
const DocsLayout = lazy(() => import("@/components/docs/DocsLayout"))
const DocsPage = lazy(() => import("@/pages/DocsPage"))
const AdvisoriesPage = lazy(() => import("@/pages/AdvisoriesPage"))
const ThreatFamiliesPage = lazy(() => import("@/pages/ThreatFamiliesPage"))
const StatusPage = lazy(() => import("@/pages/StatusPage"))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  )
}

function LazyRoute({ children, fallback = <LoadingSpinner /> }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback}>{children}</Suspense>
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
          <Route path="/dashboard/*" element={<LazyRoute><PartnerDashboardPage /></LazyRoute>} />
          <Route element={<MarketingShell />}>
            <Route path="/" element={<LazyRoute><HomePage /></LazyRoute>} />
            <Route path="/scan" element={<LazyRoute><ScanPage /></LazyRoute>} />
            <Route path="/status" element={<LazyRoute><StatusPage /></LazyRoute>} />
            <Route path="/attestations/:shareId" element={<LazyRoute><AttestationPage /></LazyRoute>} />
            <Route path="/reports/:submissionId" element={<LazyRoute fallback={<PublicReportSkeleton />}><PublicReportPage /></LazyRoute>} />
            <Route path="/schedule1/mods/:modId" element={<LazyRoute><SourceReportRedirectPage /></LazyRoute>} />
            <Route path="/c/:community/p/:namespace/:packageName" element={<LazyRoute><SourceReportRedirectPage /></LazyRoute>} />
            <Route path="/inspector" element={<LazyRoute><InspectorPage /></LazyRoute>} />
            <Route path="/docs" element={
              <LazyRoute>
                <DocsLayout />
              </LazyRoute>
            }>
              {allDocs.map((doc) => (
                doc.slug === '' ? 
                  <Route key={doc.id} index element={<LazyRoute><DocsPage doc={doc} /></LazyRoute>} /> :
                  <Route key={doc.id} path={doc.slug} element={<LazyRoute><DocsPage doc={doc} /></LazyRoute>} />
              ))}
              <Route path="*" element={<Navigate to="/docs" replace />} />
            </Route>
            <Route path="/advisories" element={<AdvisoriesLayout />}>
              <Route index element={<LazyRoute><AdvisoriesPage /></LazyRoute>} />
              <Route path="families" element={<LazyRoute><ThreatFamiliesPage /></LazyRoute>} />
              <Route path="families/:slug" element={<LazyRoute><ThreatFamiliesPage /></LazyRoute>} />
              <Route path=":slug" element={<LazyRoute><AdvisoriesPage /></LazyRoute>} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </>
    </BrowserRouter>
  )
}

export default App
