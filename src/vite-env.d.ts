/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HALLOWEEN_MODE?: 'auto' | 'on' | 'off'
  readonly VITE_POSTHOG_PROJECT_TOKEN?: string
  readonly VITE_POSTHOG_REGION?: string
  readonly VITE_TELEMETRY_ENVIRONMENT?: string
  readonly VITE_PUBLIC_API_BASE_URL?: string
  VITE_PUBLIC_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
