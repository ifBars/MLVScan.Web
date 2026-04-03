export type HomeFaq = {
  question: string
  answer: string
}

export const homeFaqs: HomeFaq[] = [
  {
    question: "Is there a Unity mod antivirus for MelonLoader and BepInEx mods?",
    answer:
      "MLVScan is a Unity mod malware scanner built for MelonLoader and BepInEx DLL mods. It inspects .NET assemblies locally before they run inside the game.",
  },
  {
    question: "Does MLVScan upload my mods to a server?",
    answer:
      "The browser scanner runs entirely in your browser, so your files stay on your device. Optional runtime report upload is off by default and only exists to help investigate false positives.",
  },
  {
    question: "What kinds of malicious behavior can MLVScan detect?",
    answer:
      "MLVScan looks for behaviors like download-and-execute chains, hidden process launches, encoded payload staging, suspicious reflection, and other reused malware patterns seen in mod reuploads.",
  },
  {
    question: "Which mod environments does MLVScan support?",
    answer:
      "MLVScan documents support for MelonLoader, BepInEx 5, BepInEx 6 Mono, and BepInEx 6 IL2CPP workflows.",
  },
]
