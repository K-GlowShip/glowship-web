/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEMO_LOGIN?: string
  readonly VITE_ADMIN_COMPANY_ID?: string
  readonly VITE_ADMIN_COMPANY_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
