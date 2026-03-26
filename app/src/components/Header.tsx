"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Globe, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Monitor,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  transparent?: boolean;
}

export const Header = ({ transparent = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const { resolvedTheme, setLight, setDark, setSystem } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/tracking/${trackingNumber.trim()}`);
      setTrackingNumber('');
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Services', href: '/services' },
    { label: 'Tracking', href: '/tracking' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isHomePage = pathname === '/';
  const showTransparent = transparent && isHomePage && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? 'bg-transparent'
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top bar - only show on non-transparent */}
      {!showTransparent && (
        <div className="bg-slate-950 text-slate-400 text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Global Logistics Solutions
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">24/7 Support: +1 (800) SWISH-GL</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-white transition-colors">Client Portal</Link>
              <Link href="/admin/control" className="hover:text-white transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="Swish Portal" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-sky-500 ${
                  showTransparent 
                    ? 'text-white/90 hover:text-white' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Quick tracking - desktop */}
            <form onSubmit={handleTrackingSubmit} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Track shipment..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className={`w-48 pl-9 pr-3 py-2 text-sm rounded-l-lg border-r-0 transition-all ${
                    showTransparent
                      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  } border focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
                <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  showTransparent ? 'text-white/60' : 'text-slate-400'
                }`} />
              </div>
              <Button 
                type="submit"
                className="rounded-l-none bg-sky-500 hover:bg-sky-600"
              >
                Track
              </Button>
            </form>

            {/* Theme toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${showTransparent ? 'text-white hover:bg-white/10' : ''}`}
                >
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-5 h-5" />
                  ) : resolvedTheme === 'light' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Monitor className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={setLight}>
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={setDark}>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={setSystem}>
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className={`relative hidden sm:flex ${showTransparent ? 'text-white hover:bg-white/10' : ''}`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hidden sm:flex ${showTransparent ? 'text-white hover:bg-white/10' : ''}`}
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/shipments">My Shipments</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${showTransparent ? 'text-white hover:bg-white/10' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile tracking */}
            <form onSubmit={handleTrackingSubmit} className="flex">
              <input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-l-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              />
              <Button type="submit" className="rounded-l-none bg-sky-500 hover:bg-sky-600">
                Track
              </Button>
            </form>

            {/* Mobile nav */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile user links */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                href="/shipments"
                className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                My Shipments
              </Link>
              <Link
                href="/billing"
                className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Billing
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
