import type { ThreatFamilyMeta } from './types'

const families: ThreatFamilyMeta[] = [
  {
    id: 'family-resource-shell32-tempcmd-v2',
    slug: 'resource-shell32-tempcmd-v2',
    title: 'Embedded Resource Temp CMD Dropper',
    summary:
      'Embedded resource payload is written to a random TEMP .cmd file and executed via ShellExecuteEx or Process.Start.',
    contentPath: 'resource-shell32-tempcmd-v2.mdx',
    aliases: ['embedded resource temp CMD loader'],
    sampleNames: ['CustomTV_IL2CPP.dll', 'NoMoreTrash.dll', 'RealRadio.dll', 'S1API.Il2Cpp.MelonLoader.dll'],
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
    sampleNames: ['EndlessGraffiti.dll', 'FasterGrowth.dll'],
    advisorySlugs: ['2026-01-malware-fastergrowth', '2026-01-malware-endlessgraffiti'],
    behaviorTags: ['powershell', 'iwr', 'temp-batch', 'cleanup', 'hidden-window'],
  },
  {
    id: 'family-webdownload-stage-exec-v3',
    slug: 'webdownload-stage-exec-v3',
    title: 'Web Download Staged Payload Executor',
    summary:
      'A network client downloads a payload into TEMP, or carries a correlated download-and-execute flow, then executes it through cmd.exe, powershell.exe, or a direct hidden Process.Start call.',
    contentPath: 'webdownload-stage-exec-v3.mdx',
    aliases: ['WebClient temp staging executor', 'HTTP temp staging executor'],
    sampleNames: [
      'InfiniteATM.dll',
      'iis_Stupid_Menu.dll',
      'DynamicOrders.dll',
      'LongLastingFertilizer.dll',
      'MelonLoaderMod55.dll',
      'MoreTrees.dll',
      'mmr_menu_1.34.dll',
      'NoPolice.dll',
      'PeakUnlimted.dll',
      'RentalCars.dll',
      'Skitching.dll',
      'StorageHub.dll',
      'UnlimitedGraffiti.dll',
      'vortex_backuprtilizer.dll',
    ],
    advisorySlugs: [
      '2026-04-malware-dynamicorders',
      '2026-03-malware-vortex-backuprtilizer',
      '2026-03-malware-storagehub',
      '2026-03-malware-skitching',
      '2026-03-malware-rentalcars',
      '2026-03-malware-unlimitedgraffiti',
      '2026-03-malware-longlastingfertilizer',
      '2026-03-malware-nopolice',
      '2026-03-malware-customer-search-bar',
      '2026-02-malware-moretrees',
    ],
    behaviorTags: ['webdownload', 'webclient', 'httpclient', 'download-and-execute', 'temp-staging', 'cmd', 'powershell', 'process-start'],
  },
  {
    id: 'family-embedded-resource-script-stager-v1',
    slug: 'embedded-resource-script-stager-v1',
    title: 'Embedded Resource Script Stager',
    summary:
      'A script payload is stored in an embedded resource, staged or interpreted at runtime, and used to download and execute a TEMP batch or command payload.',
    contentPath: 'embedded-resource-script-stager-v1.mdx',
    aliases: ['embedded script resource downloader'],
    sampleNames: ['noclip.dll'],
    advisorySlugs: [],
    behaviorTags: ['embedded-resource', 'script', 'powershell', 'temp-batch', 'download-and-execute'],
  },
  {
    id: 'family-remote-script-pipe-shell-v1',
    slug: 'remote-script-pipe-shell-v1',
    title: 'Remote Script Piped To Shell',
    summary:
      'A command shell retrieves a remote script with a command-line web client and pipes the response directly into another shell interpreter.',
    contentPath: 'remote-script-pipe-shell-v1.mdx',
    aliases: ['curl pipe to cmd loader'],
    sampleNames: ['TwelvePlayerExpansion.dll'],
    advisorySlugs: [],
    behaviorTags: ['cmd', 'curl', 'remote-script', 'pipe-to-shell', 'download-and-execute'],
  },
  {
    id: 'family-encoded-powershell-tempcmd-stager-v1',
    slug: 'encoded-powershell-tempcmd-stager-v1',
    title: 'Encoded PowerShell Temp Command Stager',
    summary:
      'Numeric-encoded strings reconstruct a hidden cmd.exe or PowerShell launcher that downloads a command script into TEMP and starts it hidden.',
    contentPath: 'encoded-powershell-tempcmd-stager-v1.mdx',
    aliases: ['numeric encoded PowerShell temp command stager'],
    sampleNames: [
      'EnhancedCasino.dll',
      'ExperienceMultiplier.dll',
      'More Revive HP.dll',
      'More Staff Members.dll',
      'PeakUnlimitedPlayers.dll',
      'Potomatic.dll',
      'SilverMod.dll',
    ],
    advisorySlugs: [],
    behaviorTags: ['numeric-encoding', 'powershell', 'temp-cmd', 'hidden-window', 'download-and-execute'],
  },
  {
    id: 'family-hex-remote-config-tempcmd-stager-v1',
    slug: 'hex-remote-config-tempcmd-stager-v1',
    title: 'Hex Remote Config Temp CMD Stager',
    summary:
      'Hex and byte-array reconstructed strings hide remote command configuration, reflected WebClient retrieval, temporary command-file staging, and hidden cmd.exe execution.',
    contentPath: 'hex-remote-config-tempcmd-stager-v1.mdx',
    aliases: ['hex config reflective temp cmd stager', 'reflected WebClient temp command stager'],
    sampleNames: ['CopyPasteFilterHotkeys_IL2Cpp.dll', 'MegaMenu.dll'],
    advisorySlugs: [],
    behaviorTags: ['hex-encoding', 'byte-array-strings', 'webclient', 'reflection', 'temp-cmd', 'hidden-window'],
  },
  {
    id: 'family-dynamic-assembly-reflection-loader-v1',
    slug: 'dynamic-assembly-reflection-loader-v1',
    title: 'Dynamic Assembly Reflection Loader',
    summary:
      'Opaque assembly bytes are loaded at runtime and invoked through reflection, separating a visible mod wrapper from the executable payload.',
    contentPath: 'dynamic-assembly-reflection-loader-v1.mdx',
    aliases: ['Assembly.Load reflective payload loader'],
    sampleNames: [
      'FPSCounter.dll',
      'GUITweaks.dll',
      'iiModdedV5.dll',
      'RemoveBlur.dll',
      'RemovePixelation.dll',
      'XZRAV1.dll',
      'YAPYAPFPSCounter.dll',
      'ZeroDeathDrops.dll',
    ],
    advisorySlugs: [],
    behaviorTags: ['assembly-load', 'reflection', 'dynamic-code-loading', 'plugin-loader', 'hidden-execution'],
  },
  {
    id: 'family-obfuscated-metadata-loader-v2',
    slug: 'obfuscated-metadata-loader-v2',
    title: 'Obfuscated Metadata-Backed Loader',
    summary:
      'Encoded strings, numeric transforms, and assembly metadata are used to reconstruct staged hidden command launchers at runtime.',
    contentPath: 'obfuscated-metadata-loader-v2.mdx',
    aliases: ['numeric metadata execution chain'],
    sampleNames: [
      'ATMUnlimitedDeposit.dll',
      'CheatBox4.dll',
      'DealerMod.dll',
      'iis_Stupid_Menu.dll',
      'isOPOptimizationMod.dll',
      'NoDeliveryWait.dll',
      'PeakUnlimted.dll',
      'ScheduleIMoreNpcs.dll',
      'UnlimitedBatteries.dll',
      'WinterBackpackMod.dll',
    ],
    advisorySlugs: ['2025-11-malware-scheduleimorenpcs'],
    behaviorTags: ['obfuscation', 'assembly-metadata', 'numeric-encoding', 'base64', 'reflection', 'hidden-loader'],
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
