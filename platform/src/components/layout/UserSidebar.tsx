'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Database, 
  MessageSquare, 
  PenTool, 
  FileText, 
  BarChart2, 
  Mail, 
  Sliders, 
  Settings, 
  User,
  Menu,
  X,
  LogOut,
  Plug,
  Users,
  Shield,
  Workflow,
  LayoutTemplate
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dataset Portal', href: '/dashboard/datasets', icon: Database },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Collaboration', href: '/dashboard/collaboration', icon: Users },
  { name: 'Security', href: '/dashboard/security', icon: Shield },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
  { name: 'Content CMS', href: '/dashboard/cms', icon: LayoutTemplate },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Visual Builder', href: '/dashboard/builder', icon: PenTool },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Email Library', href: '/dashboard/emails', icon: Mail },
  { name: 'Advanced', href: '/dashboard/advanced', icon: Sliders },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Profile', href: '/dashboard/settings/profile', icon: User },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20 transition-transform active:scale-95"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
            <span className="font-bold text-lg tracking-tight text-white">DevFort</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-24 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border-l-4 border-transparent'
                }`}
              >
                <Icon 
                  size={16} 
                  className={`${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} 
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
