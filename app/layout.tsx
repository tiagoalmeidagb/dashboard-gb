import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}