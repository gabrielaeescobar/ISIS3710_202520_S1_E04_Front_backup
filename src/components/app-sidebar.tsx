import { Calendar, DollarSign, Home, Inbox, Search, Settings } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useLocale } from "@/components/locale-provider"


export function AppSidebar() {
  const { translate } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

// Menu items.
const items = [
    {
      title: translate('sidebar.home', 'Home'),
      url: "/home",
      icon: Home,
    },
    {
      title: translate('sidebar.groups', 'Grupos'),
      url: "/grupos",
      icon: Inbox,
    },
    {
      title: translate('sidebar.trips', 'Viajes'),
      url: "/viajes",
      icon: Search,
    },
    {
      title: translate('sidebar.calendar', 'Calendario'),
      url: "/calendario",
      icon: Calendar,
    },
    {
      title: translate('sidebar.expenses', 'Gastos'),
      url: "/gastos",
      icon: DollarSign,
    },
    {
      title: translate('sidebar.settings', 'Ajustes'),
      url: "/ajustes",
      icon: Settings,
    },
  ]


  return (
    <Sidebar
      className="layover-sidebar"
      collapsible="none"             
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
             {translate('sidebar.application', 'Application')}           
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
