import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "next-themes"
import { LoginGate } from "@/components/login-gate"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>
            <LoginGate>
              {children}
            </LoginGate>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}