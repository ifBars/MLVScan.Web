import { typeLabels } from './types'
import type { AdvisoryMeta } from './types'

const advisories: AdvisoryMeta[] = [
  {
    id: 'malware-realandwaitingtimeonfire-2025',
    title: 'Malware Analysis: RealRadio/WaitingTimeOnFire Multi-Identity Payload',
    slug: '2025-12-malware-realandwaitingtimeonfire',
    type: 'malware-analysis',
    publishedDate: '2025-12-14',
    description: 'Analysis of RealRadio and S1API.Il2Cpp.MelonLoader, malware distributed under multiple identities using the same WaitingTimeOnFire payload with embedded resource execution.',
    contentPath: '2025-12-malware-realandwaitingtimeonfire.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute', 'multi-identity', 'waitingtimeonfire'],
  },
  {
    id: 'malware-nomoretrash-2025',
    title: 'Malware Analysis: NoMoreTrash Embedded Payload',
    slug: '2025-12-malware-nomoretrash',
    type: 'malware-analysis',
    publishedDate: '2025-12-18',
    description: 'Analysis of NoMoreTrash, a malicious mod that extracts and executes embedded payloads using shell32.dll ShellExecuteEx.',
    contentPath: '2025-12-malware-nomoretrash.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute'],
  },
  {
    id: 'malware-customtv-il2cpp-2025',
    title: 'Malware Analysis: CustomTV_IL2CPP Embedded Payload',
    slug: '2025-12-malware-customtv-il2cpp',
    type: 'malware-analysis',
    publishedDate: '2025-12-13',
    description: 'Analysis of CustomTV_IL2CPP, a malicious mod that extracts embedded "MelonBase" resource to temp files and executes via Windows ShellExecuteEx API.',
    contentPath: '2025-12-malware-customtv-il2cpp.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute', 'il2cpp'],
  },
  {
    id: 'malware-scheduleimorenpcs-2025',
    title: 'Malware Analysis: ScheduleIMoreNpcs Obfuscated Dropper',
    slug: '2025-11-malware-scheduleimorenpcs',
    type: 'malware-analysis',
    publishedDate: '2025-11-22',
    description: 'Analysis of ScheduleIMoreNpcs, a malicious mod using string obfuscation, reflection, and environment path access to hide its behavior. Uploaded November 21, 2025.',
    contentPath: '2025-11-malware-scheduleimorenpcs.mdx',
    keywords: ['malware', 'obfuscation', 'reflection', 'string-encoding', 'appdata', 'nexus-mods'],
  },
  {
    id: 'malware-endlessgraffiti-2026',
    title: 'Malware Analysis: EndlessGraffiti Payload Dropper',
    slug: '2026-01-malware-endlessgraffiti',
    type: 'malware-analysis',
    publishedDate: '2026-01-12',
    description: 'Analysis of EndlessGraffiti, a malicious mod that downloads and executes a payload via PowerShell. Uploaded to Nexus Mods on January 11, taken down within an hour with less than 10 downloads.',
    contentPath: '2026-01-malware-endlessgraffiti.mdx',
    keywords: ['malware', 'powershell', 'payload', 'downloader', 'nexus-mods', 'c2', 'fingercakes4sale'],
  },
  {
    id: 'false-positive-lethallizard-2026',
    title: 'False Positive: LethalLizard.ModManager Process.Start Usage',
    slug: '2026-02-false-positive-lethallizard-modmanager',
    type: 'false-positive',
    publishedDate: '2026-02-17',
    affectedVersions: ['MLVScan.Core 1.1.6 and below', 'MLVScan 1.6.2 and below'],
    description: 'MLVScan incorrectly flagged LethalLizard.ModManager as Critical severity for legitimate use of Process.Start to open folders and restart the game. Fixed with contextual IL analysis in 1.1.7/1.6.3.',
    contentPath: '2026-02-false-positive-lethallizard-modmanager.mdx',
    keywords: ['false-positive', 'process-start', 'lethallizard', 'modmanager', 'explorer', 'restart', 'contextual-analysis'],
  },
  {
    id: 'false-positive-simplesingleplayerrespawn-2026',
    title: 'False Positive: SimpleSingleplayerRespawn Dynamic Assembly Loading',
    slug: '2026-02-false-positive-simplesingleplayerrespawn',
    type: 'false-positive',
    publishedDate: '2026-02-05',
    affectedVersions: ['MLVScan.Core 1.1.5 and below', 'MLVScan 1.6.1 and below'],
    description: 'MLVScan incorrectly flagged SimpleSingleplayerRespawn as Critical severity for legitimate use of Assembly.Load for runtime IL patching. Fixed with AssemblyDynamicLoadRule in 1.1.6/1.6.2.',
    contentPath: '2026-02-false-positive-simplesingleplayerrespawn.mdx',
    keywords: ['false-positive', 'assembly-load', 'harmony', 'patching', 'dynamic-loading', 'respawn', 'singleplayer'],
  },
  {
    id: 'false-positive-bankapp-2026',
    title: 'False Positive: BankApp Icon Download Flagged as Dropper',
    slug: '2026-02-false-positive-bankapp',
    type: 'false-positive',
    publishedDate: '2026-02-10',
    affectedVersions: ['BankApp 2.0.3 and below'],
    description: 'MLVScan incorrectly flagged BankApp as High severity because its EnsureIconFileExists coroutine downloads a PNG icon from Imgur and writes it to UserData — a legitimate asset-caching pattern. The mod author resolved this in BankApp 2.0.4 on February 10 by compiling the icon in as an embedded resource.',
    contentPath: '2026-02-false-positive-bankapp.mdx',
    keywords: ['false-positive', 'network-call', 'file-write', 'unitywebrequest', 'coroutine', 'icon', 'bankapp', 'userdata'],
  },
]

export const allAdvisories = advisories

export const advisoriesBySlug: Record<string, AdvisoryMeta> = advisories.reduce(
  (acc, advisory) => {
    acc[advisory.slug] = advisory
    return acc
  },
  {} as Record<string, AdvisoryMeta>
)

export const advisoriesByYear = (): Record<number, AdvisoryMeta[]> => {
  const grouped: Record<number, AdvisoryMeta[]> = {}
  
  advisories.forEach(advisory => {
    const year = new Date(advisory.publishedDate).getFullYear()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(advisory)
  })
  
  Object.keys(grouped).forEach(year => {
    grouped[Number(year)].sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )
  })
  
  return grouped
}

export const sortedYears = (): number[] => {
  return Object.keys(advisoriesByYear())
    .map(Number)
    .sort((a, b) => b - a)
}

export const getAdvisoryBySlug = (slug: string): AdvisoryMeta | undefined => {
  return advisoriesBySlug[slug]
}

export const getAdvisoriesByType = (type: AdvisoryMeta['type']): AdvisoryMeta[] => {
  return advisories.filter(a => a.type === type)
}



export const getTypeLabel = (type: AdvisoryMeta['type']): string => {
  return typeLabels[type]
}

export const sortAdvisoriesByDate = (descending = true): AdvisoryMeta[] => {
  return [...advisories].sort((a, b) => {
    const dateA = new Date(a.publishedDate).getTime()
    const dateB = new Date(b.publishedDate).getTime()
    return descending ? dateB - dateA : dateA - dateB
  })
}
