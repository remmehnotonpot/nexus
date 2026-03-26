"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Package,
  PlusCircle,
  MessageCircle,
  Menu,
  LayoutDashboard,
  MapPin,
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  highlight?: boolean;
  badge?: number;
  staffOnly?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isStaff } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const isOpsRoute = pathname?.startsWith('/ops');

  const navItems: NavItem[] = [
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      href: isOpsRoute ? '/ops/dashboard' : '/dashboard',
    },
    {
      icon: <Package className="h-6 w-6" />,
      label: 'Shipments',
      href: isOpsRoute ? '/ops/shipments' : '/shipments',
      badge: 0,
    },
    {
      icon: <PlusCircle className="h-7 w-7" />,
      label: 'New',
      href: isOpsRoute ? '/ops/shipments/new' : '/shipments/new',
      highlight: true,
      staffOnly: true,
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      label: 'Tracking',
      href: '/tracking',
    },
    {
      icon: <Menu className="h-6 w-6" />,
      label: 'Menu',
      href: '#',
    },
  ];

  const visibleItems = navItems.filter(item => 
    !item.staffOnly || isStaff()
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground",
                  item.highlight && "relative -top-3"
                )}
              >
                {item.highlight ? (
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg">
                    {item.icon}
                  </div>
                ) : (
                  <div className="relative">
                    {item.icon}
                    {item.badge ? (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-destructive rounded-full">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </div>
                )}
                <span className={cn(
                  "text-xs mt-0.5",
                  item.highlight && "mt-1"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for content */}
      <div className="h-16" />
    </>
  );
}

// Safe area padding for iOS
export function SafeAreaProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-safe">
      {children}
    </div>
  );
}
