import type { PartnerProfile } from "@/types/partner-dashboard"

export function getPartnerIdentityLabel(partner: PartnerProfile): string {
  if (isPlaceholderDiscordEmail(partner.email)) {
    return partner.discordUsername
      ? `Discord: ${partner.discordUsername}`
      : "Discord account"
  }

  return partner.email
}

function isPlaceholderDiscordEmail(email: string): boolean {
  return /^discord_[^@]+@placeholder\.mlvscan$/i.test(email.trim())
}
