'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Settings, 
  Users, 
  MessageSquare,
  BarChart,
  LogOut,
  FolderOpen,
  Cpu,
  Workflow,
  Database,
  UploadCloud,
  Link as LinkIcon,
  ChevronDown,
  MonitorPlay,
  Wrench,
  Brain,
  Shield,
  Menu,
  X,
  Plug,
  Globe
} from 'lucide-react';
import { useState } from 'react';
 
const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Content/Pages', href: '/admin/content', icon: FileText },
  { name: 'Services', href: '/admin/services', icon: Briefcase },
  { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { name: 'Blog & Comments', href: '/admin/blog', icon: MessageSquare },
  { name: 'Leads & CRM', href: '/admin/leads', icon: Users },
  { name: 'SEO Lead Gen', href: '/admin/lead-gen', icon: Globe },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'ML Pipeline', href: '/admin/ml-pipeline', icon: Brain },
  { name: 'AI Providers', href: '/admin/ai/providers', icon: Cpu },
  { name: 'AI Workflows', href: '/admin/ai/workflows', icon: Workflow },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    subItems: [
      {
        name: 'API Integrations',
        href: '/admin/settings/integrations',
        icon: Plug,
      },
      {
        name: 'Web Editor',
        href: '/admin/settings/web-editor',
        icon: MonitorPlay,
        nestedItems: [
          { name: 'Home Page Editor', href: '/admin/home-editor', icon: LayoutDashboard },
          { name: 'About Editor', href: '/admin/about-editor', icon: LayoutDashboard },
          { name: 'Contact Editor', href: '/admin/contact-editor', icon: LayoutDashboard },
          { name: 'Skill Editor', href: '/admin/skill-editor', icon: LayoutDashboard },
          { name: 'Resume Editor', href: '/admin/resume-editor', icon: LayoutDashboard },
          { name: 'Pricing Editor', href: '/admin/pricing-editor', icon: LayoutDashboard },
          { name: 'Auto Repair (Diagnostics)', href: '/admin/settings/web-editor/auto-repair', icon: Wrench },
        ]
      },
      {
        name: 'Security & Admins',
        href: '/admin/security',
        icon: Shield,
      }
    ]
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Settings': true,
    'Web Editor': true
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

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

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">AdminPanel</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const hasSubItems = !!item.subItems;
          const isMenuOpen = openMenus[item.name];

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                    isActive ? 'bg-primary/10 text-primary border-primary pl-2' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                    isActive ? 'bg-primary/10 text-primary border-primary pl-2' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )}

              {/* Sub Items */}
              {hasSubItems && isMenuOpen && (
                <div className="pl-6 mt-1 space-y-1 border-l-2 border-border/50 ml-5">
                  {item.subItems!.map(sub => {
                    const isSubActive = pathname === sub.href || (sub.href !== '/admin/settings/web-editor' && pathname.startsWith(`${sub.href}/`));
                    const SubIcon = sub.icon;
                    return (
                      <div key={sub.name}>
                        {sub.nestedItems ? (
                          <div className="space-y-1">
                            <button
                              onClick={() => toggleMenu(sub.name)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                isSubActive ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <SubIcon className="w-4 h-4" />
                                {sub.name}
                              </div>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenus[sub.name] ? 'rotate-180' : ''}`} />
                            </button>
                            {openMenus[sub.name] && (
                              <div className="pl-6 mt-1 space-y-1 border-l-2 border-border/30 ml-4">
                                {sub.nestedItems.map(nested => (
                                  <Link
                                    key={nested.name}
                                    href={nested.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                      pathname === nested.href ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    <nested.icon className="w-4 h-4" />
                                    {nested.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={sub.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                              isSubActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            {sub.name}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
      </aside>
    </>
  );
}
