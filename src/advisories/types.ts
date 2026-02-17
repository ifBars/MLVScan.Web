export type AdvisoryType = 'malware-analysis' | 'bypass-incident' | 'false-positive' | 'security-update'

export type AdvisoryMeta = {
  id: string
  title: string
  slug: string
  type: AdvisoryType
  publishedDate: string
  updatedDate?: string
  affectedVersions?: string[]
  description: string
  contentPath: string
  keywords: string[]
}

export const typeLabels: Record<AdvisoryType, string> = {
  'malware-analysis': 'Malware Analysis',
  'bypass-incident': 'Scanner Bypass',
  'false-positive': 'False Positive',
  'security-update': 'Security Update',
}
