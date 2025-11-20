'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Home,
  FileText,
  Folder,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  Tag,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Notes', href: '/dashboard/notes', icon: FileText },
    { name: 'Favorites', href: '/dashboard/favorites', icon: Star },
    { name: 'Folders', href: '/dashboard/folders', icon: Folder },
    { name: 'Tags', href: '/dashboard/tags', icon: Tag },
    { name: 'Sources', href: '/dashboard/sources', icon: Users },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  ];

  const bottomNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-newsprint">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-ink/10 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-ink" />
          <span className="font-newsreader font-bold text-xl text-ink">Journo Journal</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-ink/5 rounded-sm"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-ink/10 z-40 pt-16"
          >
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-sm font-dm transition-colors',
                      isActive
                        ? 'bg-highlight-amber/20 text-ink font-semibold'
                        : 'text-ink/70 hover:bg-ink/5'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        className="hidden lg:block fixed inset-y-0 left-0 bg-white border-r border-ink/10 z-40"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-ink/10 flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-ink" strokeWidth={2.5} />
                <span className="font-newsreader font-extrabold text-xl text-ink">
                  Journo Journal
                </span>
              </Link>
            )}
            {sidebarCollapsed && (
              <BookOpen className="w-7 h-7 text-ink mx-auto" strokeWidth={2.5} />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-sm font-dm transition-colors',
                    isActive
                      ? 'bg-highlight-amber/20 text-ink font-semibold'
                      : 'text-ink/70 hover:bg-ink/5',
                    sidebarCollapsed && 'justify-center'
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-ink/10 p-4 space-y-1">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-sm font-dm text-ink/70 hover:bg-ink/5 transition-colors',
                  sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            ))}

            {/* User Profile */}
            <div
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-ink/5 transition-colors cursor-pointer',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <div className="w-8 h-8 bg-highlight-amber rounded-full flex items-center justify-center text-ink font-bold text-sm flex-shrink-0">
                {session?.user?.name?.[0] || 'U'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-dm font-medium text-ink truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-ink/60 truncate">{session?.user?.email}</p>
                </div>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={() => signOut()}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-sm font-dm text-highlight-red hover:bg-highlight-red/10 transition-colors',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center px-4 py-2 text-ink/40 hover:text-ink transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={clsx(
          'min-h-screen pt-16 lg:pt-0',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
