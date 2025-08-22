"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../_lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTenantConfig } from "../_hooks/useTenant"
import { TenantChooser } from "./TenantChooser"
import { useTheme } from "@/providers/Theme"
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  FolderOpen,
  MessageSquare,
  Calendar,
  Mail,
  CheckSquare,
  Settings,
  Key,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Package,
  TrendingUp,
  LogOut,
  User,
  Bell,
  Palette,
  Sparkles,
  Bot,
  UserCheck,
  UserPlus,
  Target,
  Megaphone,
  Building,
  ListTodo,
  CalendarDays,
  File,
  Map,
  Store,
} from "lucide-react"

interface NavigationSubItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  current?: boolean
  badge?: string
  count?: number
  expandable?: boolean
  subItems?: NavigationSubItem[]
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Angel OS", href: "/dashboard/angel-os", icon: Sparkles, badge: "Core" },
      { name: "LEO Assistant", href: "/dashboard/leo", icon: Bot, badge: "Active" },
    ],
  },
  {
    title: "Business Operations",
    items: [
      { name: "Products", href: "/dashboard/products", icon: Package },
      { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "POS System", href: "/dashboard/pos", icon: CreditCard },
      { name: "E-commerce", href: "/dashboard/ecommerce", icon: Store },
    ],
  },
  {
    title: "Customer Management",
    items: [
      { name: "CRM Dashboard", href: "/dashboard/crm", icon: Users },
      { name: "Contacts", href: "/dashboard/crm/contacts", icon: UserCheck },
      { name: "Leads", href: "/dashboard/leads", icon: UserPlus, badge: "New" },
      { name: "Opportunities", href: "/dashboard/opportunities", icon: Target, badge: "New" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone, badge: "New" },
      { name: "Website Analytics", href: "/dashboard/website-analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
      { name: "Spaces", href: "/dashboard/spaces", icon: Building },
      { name: "Messages", href: "/dashboard/chats", icon: Mail },
    ],
  },
  {
    title: "Productivity",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: FolderOpen, badge: "New" },
      { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, badge: "New" },
      { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { name: "Todos", href: "/dashboard/todos", icon: ListTodo },
      { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "File Manager", href: "/dashboard/file-manager", icon: FolderOpen },
      { name: "Files", href: "/dashboard/files", icon: File },
    ],
  },
  {
    title: "System",
    items: [
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        expandable: true,
        subItems: [
          { name: "Profile", href: "/dashboard/settings/profile", icon: User },
          { name: "Account", href: "/dashboard/settings/account", icon: Settings },
          { name: "Appearance", href: "/dashboard/settings/appearance", icon: Palette },
          { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
          { name: "Integrations", href: "/dashboard/settings/integrations", icon: Key },
        ],
      },
      { name: "Roadmap", href: "/dashboard/roadmap", icon: Map, badge: "New" },
    ],
  },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname() || ""
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [forceRender, setForceRender] = useState(0)
  const { tenant, config, features } = useTenantConfig()
  const { theme } = useTheme() // Subscribe to theme changes

  // Listen for theme changes and force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      console.log('Sidebar received theme change event')
      setForceRender(prev => prev + 1)
    }
    
    window.addEventListener('themeChanged', handleThemeChange)
    return () => window.removeEventListener('themeChanged', handleThemeChange)
  }, [])
  // Temporarily mock user data until auth is properly integrated
  const user = {
    id: 1,
    firstName: 'Kenneth',
    lastName: 'Courtney',
    name: 'Kenneth Courtney',
    email: 'kenneth.courtney@gmail.com',
    globalRole: 'super_admin',
    profileImage: { url: '/placeholder.svg?height=32&width=32' }
  }

  const toggleExpanded = (name: string) => {
    if (!name) return
    setExpandedItems((prev) => {
      const currentItems = prev || []
      return currentItems.includes(name) ? currentItems.filter((item) => item !== name) : [...currentItems, name]
    })
  }

  // Filter navigation based on tenant features
  const filteredNavigation = navigation.map((section: NavigationSection) => ({
    ...section,
    items: section.items.filter((item: NavigationItem) => {
      // Show all Overview items
      if (section.title === "Overview") return true
      
      // Filter Business Operations based on tenant features
      if (section.title === "Business Operations") {
        if ((item.name === "Products" || item.name === "Orders" || item.name === "POS System" || item.name === "E-commerce") && !features.ecommerce) return false
      }
      
      // Filter Customer Management based on CRM features
      if (section.title === "Customer Management") {
        if (!features.crm) return false
      }
      
      // Filter Communication based on spaces features
      if (section.title === "Communication") {
        if ((item.name === "Chat" || item.name === "Spaces") && !features.spaces) return false
      }
      
      // Show all other sections by default
      return true
    })
  })).filter((section: NavigationSection) => section.items.length > 0) // Remove empty sections

  return (
    <motion.div
      key={`${theme}-${forceRender}`} // Force re-render when theme changes
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 256,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="flex flex-col bg-sidebar border-r border-sidebar-border relative"
      style={{
        // Force CSS variable updates
        backgroundColor: 'hsl(var(--sidebar))',
        borderColor: 'hsl(var(--sidebar-border))',
        color: 'hsl(var(--sidebar-foreground))'
      }}
    >
      {onToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="h-3 w-3" />
          </motion.div>
        </Button>
      )}

      <motion.div
        className="flex items-center gap-2 p-4 border-b border-sidebar-border"
        animate={{
          justifyContent: isCollapsed ? "center" : "flex-start",
        }}
      >
        <TenantChooser userId={user.id} />
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredNavigation.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 overflow-hidden"
                >
                  {section.title}
                </motion.h3>
              )}
            </AnimatePresence>
            <nav className="space-y-1">
              {section.items.map((item: NavigationItem) => {
                const isActive = pathname === item.href
                const isExpanded = (expandedItems || []).includes(item.name || "") || false

                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2",
                      )}
                      onClick={(e) => {
                        if (item.expandable) {
                          e.preventDefault()
                          toggleExpanded(item.name || "")
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between flex-1 overflow-hidden"
                          >
                            <span className="whitespace-nowrap">{item.name}</span>
                            <div className="flex items-center gap-1">
                              {item.badge && (
                                <Badge
                                  variant={item.badge === "New" ? "default" : "secondary"}
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              {item.count && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  {item.count}
                                </Badge>
                              )}
                              {item.expandable && (
                                <ChevronRight
                                  className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
                                />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border whitespace-nowrap z-50 pointer-events-none"
                        >
                          {item.name}
                        </motion.div>
                      )}
                    </Link>

                    <AnimatePresence>
                      {!isCollapsed && isExpanded && item.subItems && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems.map((subItem: NavigationSubItem) => {
                            const isSubActive = pathname === subItem.href
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-1.5 text-xs rounded-md transition-colors",
                                  isSubActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground",
                                )}
                              >
                                <subItem.icon className="h-3 w-3 shrink-0" />
                                <span className="whitespace-nowrap">{subItem.name}</span>
                              </Link>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <motion.div
        className="p-4 border-t border-sidebar-border relative"
        animate={{
          paddingLeft: isCollapsed ? 12 : 16,
          paddingRight: isCollapsed ? 12 : 16,
        }}
      >
        <Link href="/dashboard/settings" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full p-0 h-auto hover:bg-sidebar-accent/50 rounded-lg",
              isCollapsed && "justify-center"
            )}
          >
          <div className={cn("flex items-center gap-3 p-2", isCollapsed && "justify-center")}>
          <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.profileImage?.url || "/placeholder.svg?height=32&width=32"} />
              <AvatarFallback>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                  : user?.email?.[0]?.toUpperCase() || 'U'
                }
              </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 overflow-hidden text-left"
                >
                  <p className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || user?.email?.split('@')[0] || 'User'
                    }
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.email || 'No email'}
                  </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                  <Settings className="h-4 w-4 text-sidebar-foreground/60" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </Button>
        </Link>

        {/* Profile Menu */}
        <AnimatePresence>
          {showProfileMenu && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="p-1">
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
                <Link 
                  href="/dashboard/settings/account" 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
                <Link 
                  href="/dashboard/settings/appearance" 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Palette className="h-4 w-4" />
                  Appearance
                </Link>
                <Link 
                  href="/dashboard/settings/notifications" 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
                <div className="h-px bg-border my-1" />
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
                <div className="h-px bg-border my-1" />
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-red-600 hover:text-red-600"
                  onClick={() => {
                    setShowProfileMenu(false)
                    window.location.href = '/admin/logout'
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
