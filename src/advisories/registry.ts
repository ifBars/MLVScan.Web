import { typeLabels } from './types'
import type { AdvisoryMeta } from './types'

const advisories: AdvisoryMeta[] = [
  {
    id: 'malware-dynamicorders-2026',
    title: 'Malware Analysis: Malicious DynamicOrders Reupload',
    slug: '2026-04-malware-dynamicorders',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-04-16',
    description: 'Analysis of a malicious reupload distributed as DynamicOrders that resolves a PowerShell path, downloads a staged script into the temp directory, and launches it hidden with a cmd fallback.',
    contentPath: '2026-04-malware-dynamicorders.mdx',
    keywords: ['malware', 'dynamicorders', 'webclient', 'powershell', 'cmd', 'download-and-execute', 'temp-staging', 'melonloadermod62'],
  },
  {
    id: 'malware-unlimitedgraffiti-2026',
    title: 'Malware Analysis: UnlimitedGraffiti / No Art Limit Reupload',
    slug: '2026-03-malware-unlimitedgraffiti',
    aliases: ['2026-04-malware-no-art-limit'],
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-03',
    updatedDate: '2026-04-17',
    affectedVersions: ['MLVScan.Core 1.3.7 and earlier', 'MLVScan 2.0.1 and earlier'],
    description: 'Analysis of a malicious mod lineage first reuploaded as UnlimitedGraffiti in March 2026 and later resurfaced on April 3, 2026 as No Art Limit. The retained sample used for static analysis is the April No Art Limit reupload, which stages a remote PowerShell script in TEMP and launches it hidden.',
    contentPath: '2026-03-malware-unlimitedgraffiti.mdx',
    keywords: ['malware', 'unlimitedgraffiti', 'no-art-limit', 'httpclient', 'powershell', 'download-and-execute', 'temp-staging', 'detection-gap', 'reupload'],
  },
  {
    id: 'malware-vortex-backuprtilizer-2026',
    title: 'Malware Analysis: vortex_backuprtilizer LongLastingFertilizer Variant',
    slug: '2026-03-malware-vortex-backuprtilizer',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-28',
    description: 'Analysis of the retained vortex_backuprtilizer sample, which presents itself as LongLastingFertilizer while downloading a staged PowerShell script into the temp directory and launching it hidden.',
    contentPath: '2026-03-malware-vortex-backuprtilizer.mdx',
    keywords: ['malware', 'vortex-backuprtilizer', 'longlastingfertilizer', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'melonloadermod57'],
  },
  {
    id: 'malware-storagehub-2026',
    title: 'Malware Analysis: Malicious StorageHub Reupload',
    slug: '2026-03-malware-storagehub',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-25',
    description: 'Analysis of a malicious Terraria mod reupload distributed as StorageHub that hides a downloader helper inside a larger legitimate-looking codebase, stages a script in the temp directory, and launches it hidden.',
    contentPath: '2026-03-malware-storagehub.mdx',
    keywords: ['malware', 'storagehub', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'terrariamodder', 'nested-helper'],
  },
  {
    id: 'malware-skitching-2026',
    title: 'Malware Analysis: Malicious Skitching Reupload',
    slug: '2026-03-malware-skitching',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-25',
    description: 'Analysis of a malicious reupload distributed as Skitching that downloads a staged PowerShell script into the temp directory and launches it through an explicit SysNative PowerShell path.',
    contentPath: '2026-03-malware-skitching.mdx',
    keywords: ['malware', 'skitching', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'melonloadermod59'],
  },
  {
    id: 'malware-rentalcars-2026',
    title: 'Malware Analysis: Malicious RentalCars Reupload',
    slug: '2026-03-malware-rentalcars',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-25',
    description: 'Analysis of a malicious reupload distributed as RentalCars that uses a system-looking helper namespace to download a staged PowerShell script into the temp directory and execute it hidden.',
    contentPath: '2026-03-malware-rentalcars.mdx',
    keywords: ['malware', 'rentalcars', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'melonloadermod58'],
  },
  {
    id: 'malware-longlastingfertilizer-2026',
    title: 'Malware Analysis: Malicious LongLastingFertilizer Reupload',
    slug: '2026-03-malware-longlastingfertilizer',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-22',
    description: 'Analysis of a malicious reupload distributed as LongLastingFertilizer that stages a downloaded PowerShell script in the temp directory and launches it hidden.',
    contentPath: '2026-03-malware-longlastingfertilizer.mdx',
    keywords: ['malware', 'longlastingfertilizer', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'melonloadermod57'],
  },
  {
    id: 'malware-fastergrowth-2026',
    title: 'Malware Analysis: Malicious FasterGrowth Reupload',
    slug: '2026-01-malware-fastergrowth',
    type: 'malware-analysis',
    familyId: 'family-powershell-iwr-dlbat-v1',
    publishedDate: '2026-01-15',
    description: 'Analysis of a malicious reupload distributed as FasterGrowth that launches hidden PowerShell to fetch and execute a staged batch payload from the temp directory.',
    contentPath: '2026-01-malware-fastergrowth.mdx',
    keywords: ['malware', 'fastergrowth', 'powershell', 'iwr', 'batch', 'download-and-execute', 'known-threat', 'melonloadermod38'],
  },
  {
    id: 'malware-nopolice-2026',
    title: 'Malware Analysis: Malicious NoPolice Reupload',
    slug: '2026-03-malware-nopolice',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-13',
    description: 'Analysis of a malicious reupload distributed as NoPolice that downloads a staged PowerShell payload into the temp directory and executes it hidden.',
    contentPath: '2026-03-malware-nopolice.mdx',
    keywords: ['malware', 'nopolice', 'webclient', 'powershell', 'download-and-execute', 'temp-staging', 'melonloadermod56'],
  },
  {
    id: 'malware-customer-search-bar-2026',
    title: 'Malware Analysis: Malicious Search Bar Reupload',
    slug: '2026-03-malware-customer-search-bar',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-05',
    description: 'Analysis of a malicious reupload distributed as Search Bar / Customer Search Bar that downloads Venticularjpeggerson.exe from a malicious delivery domain into %TEMP% and executes it.',
    contentPath: '2026-03-malware-customer-search-bar.mdx',
    keywords: ['malware', 'search-bar', 'customer-search-bar', 'webclient', 'download-and-execute', 'melonloadermod55'],
  },
  {
    id: 'malware-realandwaitingtimeonfire-2025',
    title: 'Malware Analysis: Malicious RealRadio and S1API Reuploads',
    slug: '2025-12-malware-realandwaitingtimeonfire',
    type: 'malware-analysis',
    familyId: 'family-resource-shell32-tempcmd-v2',
    publishedDate: '2025-12-14',
    description: 'Analysis of malicious reuploads distributed as RealRadio and S1API.Il2Cpp.MelonLoader, both carrying the same embedded-resource loader payload under different stolen identities.',
    contentPath: '2025-12-malware-realandwaitingtimeonfire.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute', 'multi-identity', 'waitingtimeonfire'],
  },
  {
    id: 'malware-nomoretrash-2025',
    title: 'Malware Analysis: Malicious NoMoreTrash Reupload',
    slug: '2025-12-malware-nomoretrash',
    type: 'malware-analysis',
    familyId: 'family-resource-shell32-tempcmd-v2',
    publishedDate: '2025-12-18',
    description: 'Analysis of a malicious reupload distributed as NoMoreTrash that extracts and executes an embedded payload via shell32.dll ShellExecuteEx.',
    contentPath: '2025-12-malware-nomoretrash.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute'],
  },
  {
    id: 'malware-customtv-il2cpp-2025',
    title: 'Malware Analysis: Malicious CustomTV_IL2CPP Reupload',
    slug: '2025-12-malware-customtv-il2cpp',
    type: 'malware-analysis',
    familyId: 'family-resource-shell32-tempcmd-v2',
    publishedDate: '2025-12-13',
    description: 'Analysis of a malicious reupload distributed as CustomTV_IL2CPP that extracts an embedded "MelonBase" resource to temp files and executes it via the Windows ShellExecuteEx API.',
    contentPath: '2025-12-malware-customtv-il2cpp.mdx',
    keywords: ['malware', 'embedded-resource', 'shell32', 'shellexecute', 'il2cpp'],
  },
  {
    id: 'malware-scheduleimorenpcs-2025',
    title: 'Malware Analysis: Malicious ScheduleIMoreNpcs Reupload',
    slug: '2025-11-malware-scheduleimorenpcs',
    type: 'malware-analysis',
    familyId: 'family-obfuscated-metadata-loader-v1',
    publishedDate: '2025-11-22',
    description: 'Analysis of a malicious reupload distributed as ScheduleIMoreNpcs that uses string obfuscation, reflection, and environment path access to hide its behavior. Uploaded November 21, 2025.',
    contentPath: '2025-11-malware-scheduleimorenpcs.mdx',
    keywords: ['malware', 'obfuscation', 'reflection', 'string-encoding', 'appdata', 'nexus-mods'],
  },
  {
    id: 'malware-endlessgraffiti-2026',
    title: 'Malware Analysis: Malicious EndlessGraffiti Reupload',
    slug: '2026-01-malware-endlessgraffiti',
    type: 'malware-analysis',
    familyId: 'family-powershell-iwr-dlbat-v1',
    publishedDate: '2026-01-12',
    description: 'Analysis of a malicious reupload distributed as EndlessGraffiti that downloads and executes a payload via PowerShell. Uploaded to Nexus Mods on January 11 and taken down within an hour with fewer than 10 downloads.',
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
  {
    id: 'malware-moretrees-2026',
    title: 'Malware Analysis: Malicious MoreTrees Reupload',
    slug: '2026-02-malware-moretrees',
    type: 'malware-analysis',
    familyId: 'family-webdownload-stage-exec-v2',
    publishedDate: '2026-03-01',
    description: 'Analysis of a malicious reupload distributed as MoreTrees that downloads and executes a staged payload via batch file. Uploaded to Nexus Mods on March 1, 2026, and detected by the Schedule 1 modding community.',
    contentPath: '2026-02-malware-moretrees.mdx',
    keywords: ['malware', 'cmd', 'batch', 'payload', 'downloader', 'nexus-mods', 'powershell', 'certutil'],
  },
]

export const allAdvisories = advisories

export const advisoriesBySlug: Record<string, AdvisoryMeta> = advisories.reduce(
  (acc, advisory) => {
    acc[advisory.slug] = advisory
    advisory.aliases?.forEach((alias) => {
      acc[alias] = advisory
    })
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
