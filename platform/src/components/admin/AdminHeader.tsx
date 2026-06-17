'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-muted/50 border border-transparent focus:border-border focus:bg-card rounded-lg text-sm w-64 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-card" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{session?.user?.name || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{session?.user?.role?.toLowerCase() || 'Admin'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {session?.user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
