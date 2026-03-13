import type { ThreatFamilyMeta } from './types'

const families: ThreatFamilyMeta[] = [
  {
    id: 'family-resource-shell32-tempcmd-v1',
    slug: 'resource-shell32-tempcmd-v1',
    title: 'Embedded Resource ShellExecute Temp CMD Dropper',
    summary:
      'Embedded resource payload is written to a random TEMP .cmd file and executed hidden via ShellExecuteEx.',
    contentPath: 'resource-shell32-tempcmd-v1.mdx',
    aliases: ['embedded resource temp CMD loader'],
    sampleNames: ['CustomTV_IL2CPP.dll.di', 'NoMoreTrash.dll.di', 'RealRadio.dll.di', 'S1API.Il2Cpp.MelonLoader.dll.di'],
    advisorySlugs: [
      '2025-12-malware-customtv-il2cpp',
      '2025-12-malware-nomoretrash',
      '2025-12-malware-realandwaitingtimeonfire',
    ],
    behaviorTags: ['embedded-resource', 'shell32', 'shellexecute', 'temp-cmd', 'hidden-execution'],
  },
  {
    id: 'family-powershell-iwr-dlbat-v1',
    slug: 'powershell-iwr-dlbat-v1',
    title: 'PowerShell IWR Temp Batch Downloader',
    summary:
      'Hidden PowerShell downloads a TEMP batch file, executes it, waits, and deletes the staged script.',
    contentPath: 'powershell-iwr-dlbat-v1.mdx',
    aliases: ['hidden PowerShell temp batch chain'],
    sampleNames: ['EndlessGraffiti.dll.di', 'FasterGrowth.dll.di'],
    advisorySlugs: ['2026-01-malware-endlessgraffiti'],
    behaviorTags: ['powershell', 'iwr', 'temp-batch', 'cleanup', 'hidden-window'],
  },
  {
    id: 'family-webclient-stage-exec-v1',
    slug: 'webclient-stage-exec-v1',
    title: 'WebClient Staged Payload Executor',
    summary:
      'WebClient downloads a payload into TEMP and immediately executes it through cmd.exe, powershell.exe, or a direct Process.Start call.',
    contentPath: 'webclient-stage-exec-v1.mdx',
    aliases: ['WebClient temp staging executor'],
    sampleNames: ['MoreTrees.dll.di', 'MelonLoaderMod55.dll.di', 'NoPolice.dll.di'],
    advisorySlugs: ['2026-03-malware-nopolice', '2026-03-malware-customer-search-bar', '2026-02-malware-moretrees'],
    behaviorTags: ['webclient', 'download-and-execute', 'temp-staging', 'cmd', 'powershell', 'process-start'],
  },
  {
    id: 'family-obfuscated-metadata-loader-v1',
    slug: 'obfuscated-metadata-loader-v1',
    title: 'Obfuscated Metadata-Backed Loader',
    summary:
      'Numeric string decoding and assembly metadata are used to reconstruct a hidden cmd.exe or PowerShell launcher at runtime.',
    contentPath: 'obfuscated-metadata-loader-v1.mdx',
    aliases: ['numeric metadata execution chain'],
    sampleNames: ['ScheduleIMoreNpcs.dll'],
    advisorySlugs: ['2025-11-malware-scheduleimorenpcs'],
    behaviorTags: ['obfuscation', 'assembly-metadata', 'numeric-encoding', 'reflection', 'hidden-loader'],
  },
]

export const allThreatFamilies = families

export const threatFamiliesBySlug: Record<string, ThreatFamilyMeta> = families.reduce(
  (acc, family) => {
    acc[family.slug] = family
    return acc
  },
  {} as Record<string, ThreatFamilyMeta>
)

export const threatFamiliesById: Record<string, ThreatFamilyMeta> = families.reduce(
  (acc, family) => {
    acc[family.id] = family
    return acc
  },
  {} as Record<string, ThreatFamilyMeta>
)

export const getThreatFamilyBySlug = (slug: string): ThreatFamilyMeta | undefined => threatFamiliesBySlug[slug]

export const getThreatFamilyById = (id?: string): ThreatFamilyMeta | undefined => (id ? threatFamiliesById[id] : undefined)
