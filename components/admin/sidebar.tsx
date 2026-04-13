'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  MapPin, 
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings,
  Shield
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface AdminSidebarProps {
  user: User
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/consignments', label: 'All Consignments', icon: Package },
  { href: '/admin/incoming', label: 'Incoming', icon: ArrowDownToLine },
  { href: '/admin/outgoing', label: 'Outgoing', icon: ArrowUpFromLine },
  { href: '/admin/trucks', label: 'Trucks', icon: Truck },
  { href: '/admin/tracking', label: 'GPS Tracking', icon: MapPin },
  { href: '/admin/missing-reports', label: 'Missing Reports', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Truck className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">LogiTrack</h1>
            <p className="text-xs text-sidebar-foreground/70">Logistics Management</p>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/auth/mfa-setup"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <Shield className="h-5 w-5" />
          Setup 2FA
        </Link>
        <div className="mt-4 px-3">
          <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
          <p className="text-sm font-medium truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  )
}
