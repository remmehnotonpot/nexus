"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Bell,
  User,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  backHref = '/ops/dashboard',
  rightElement 
}: MobileHeaderProps) {
  const router = useRouter();
  const { user, logout, isStaff } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side */}
        <div className="flex items-center gap-2 flex-1">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-2"
              onClick={() => router.push(backHref)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/" className="font-bold text-lg">
              Swish Portal
            </Link>
          )}
          {title && (
            <h1 className="font-semibold text-lg truncate">{title}</h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {rightElement}
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* User Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {user?.avatarUrl ? (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="mt-4 space-y-1">
                  {isStaff() && (
                    <>
                      <Link 
                        href="/ops/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-2 py-2.5 rounded-md hover:bg-accent transition-colors"
                      >
                        Operations Dashboard
                      </Link>
                      <Link 
                        href="/ops/shipments"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-2 py-2.5 rounded-md hover:bg-accent transition-colors"
                      >
                        All Shipments
                      </Link>
                      <Link 
                        href="/ops/customers"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-2 py-2.5 rounded-md hover:bg-accent transition-colors"
                      >
                        Customers
                      </Link>
                    </>
                  )}
                  <Link 
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-2 py-2.5 rounded-md hover:bg-accent transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-2 py-2.5 rounded-md hover:bg-accent transition-colors"
                  >
                    Settings
                  </Link>
                </nav>

                {/* Logout */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
