"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart3, Workflow, Settings, LogOut, MessageSquare, History, Layout, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/hooks/use-auth';

const navigationItems = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Canvas',
    href: '/dashboard/canvas',
    icon: Layout,
  },
  {
    name: 'Chat',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    name: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout} = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "gap-6")}>
        <Link href="/dashboard" className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-2")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs">36</span>
          </div>
          {!isCollapsed && <span className="font-semibold">LLM LAB</span>}
        </Link>
        {!isCollapsed && (
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        )}
      </div>

      <nav className="flex flex-col flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isActive && 'bg-secondary text-secondary-foreground',
                    isCollapsed ? 'justify-center px-2' : 'justify-start'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Collapse Toggle Button */}
        <div className="mt-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("w-full", isCollapsed ? "justify-center px-2" : "justify-start")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-3" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>

        <div className={cn("flex items-center mt-auto", isCollapsed ? "justify-center" : "gap-4")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} alt={user?.name || 'User'} />
                  <AvatarFallback>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="start" side="right" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!isCollapsed && <p className="text-sm font-medium leading-none">{user?.name}</p>}
        </div>
      </nav>
    </aside>
  );
}
