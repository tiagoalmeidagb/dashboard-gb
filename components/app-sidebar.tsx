"use client"

import * as React from "react"
import {
  GraduationCap,
  ShoppingBag,
  Globe,
  CalendarDays,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const ACTIVE_COLOR = "#E2211C"
const ACTIVE_BG    = "#E2211C1a"

export type PageId =
  | "gb-institute"
  | "gb-wear"
  | "gb-online"
  | "gb-events"
  | "gb-jiu-jitsu"

const pages: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "gb-institute", label: "GB Institute", icon: <GraduationCap className="w-4 h-4 shrink-0" /> },
  { id: "gb-wear",      label: "GB Wear",      icon: <ShoppingBag   className="w-4 h-4 shrink-0" /> },
  { id: "gb-online",    label: "GB Online",    icon: <Globe         className="w-4 h-4 shrink-0" /> },
  { id: "gb-events",    label: "GB Events",    icon: <CalendarDays  className="w-4 h-4 shrink-0" /> },
  { id: "gb-jiu-jitsu", label: "GB Jiu Jitsu", icon: <Shield        className="w-4 h-4 shrink-0" /> },
]

type Props = {
  activePage: PageId
  onPageChange: (page: PageId) => void
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ activePage, onPageChange, ...props }: Props) {
  return (
    <Sidebar collapsible="icon" className="border-r border-[#E0E8F4]" style={{ "--sidebar": "white" } as React.CSSProperties} {...props}>

      {/* HEADER — mesma altura do site-header (h-14) */}
      <SidebarHeader
        className="flex flex-row items-center justify-between px-3 border-b border-[#E0E8F4]"
        style={{ height: "56px", minHeight: "56px" }}
      >
        {/* Logo + texto — some o texto em modo icon */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <img
            src="/gb-logo.png"
            alt="Gracie Barra"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-sm font-semibold leading-tight whitespace-nowrap group-data-[collapsible=icon]:hidden" style={{ color: "#141414" }}>
            Marketing Growth System
          </span>
        </div>

        {/* Trigger — sempre visível */}
        <SidebarTrigger
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[#F0F4FA] flex-shrink-0"
          style={{ color: "#A7A9AC" }}
        />
      </SidebarHeader>

      <SidebarSeparator className="bg-[#E0E8F4]" />

      {/* NAV */}
      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          {pages.map((page) => {
            const isActive = activePage === page.id
            return (
              <SidebarMenuItem key={page.id}>
                <SidebarMenuButton
                  onClick={() => onPageChange(page.id)}
                  isActive={isActive}
                  tooltip={page.label}
                  style={
                    isActive
                      ? {
                          backgroundColor: ACTIVE_BG,
                          color: ACTIVE_COLOR,
                          borderLeft: `3px solid ${ACTIVE_COLOR}`,
                          borderRadius: "6px",
                          paddingLeft: "9px",
                        }
                      : {
                          borderLeft: "3px solid transparent",
                          paddingLeft: "9px",
                          color: "#636466",
                        }
                  }
                  className="flex items-center gap-3 w-full text-sm font-medium hover:bg-[#F0F4FA] transition-colors"
                >
                  <span style={{ color: isActive ? ACTIVE_COLOR : "#A7A9AC", flexShrink: 0 }}>
                    {page.icon}
                  </span>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {page.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

      </SidebarContent>

    </Sidebar>
  )
}
