export function classifySource(src: string, medium: string): string | null {
  const s = src.toLowerCase().trim()
  const m = medium.toLowerCase().trim()

  if (s.includes("institute.graciebarra.com") || s === "insidecourse") return null

  if (s === "(direct)" || (s === "(none)" && m === "(none)")) return "Direct"

  if ((s === "(not set)" || s === "") && (m === "(not set)" || m === "")) return "Unknown"

  if (s === "sitebar") return "Site Bar"

  if (s === "summit26") return "Summit 2026"

  if (
    s === "bio" || s === "mc" || s === "ig" ||
    s.includes("instagram") || s.includes("l.instagram") ||
    m === "bio" || m === "mc" || m === "social"
  ) return "Instagram"

  if (s.includes("whatsapp") || s === "wpp" || s.includes("api.whatsapp")) return "WhatsApp"

  if (
    m === "email" || m.includes("email") || m === "broadcast" ||
    s.includes("email") || s.includes("master") ||
    s.includes("mail.google.com") || s.includes("outlook.live.com") ||
    s.includes("mail.yahoo.com") || s.includes("webmail") ||
    s.includes("mailchimp") || s.includes("brevo") || s.includes("klaviyo")
  ) return "Email"

  if (s === "google" || s.startsWith("google.")) return "Google"

  if (s.includes("facebook") || s.includes("fb.me") || s.includes("m.facebook")) return "Facebook"

  if (s.includes("youtube") || s.includes("youtu.be")) return "YouTube"

  if (
    s.includes("bing") || s.includes("duckduckgo") || s.includes("qwant") ||
    s.includes("yandex") || s.includes("yahoo") || m === "organic"
  ) return "Organic Search"

  if (m === "referral") return "Referral"

  return "Other"
}
