'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Data Lab', href: '/lab' },
  { label: 'AI Tools', href: '/ai-tools' },
  { label: 'Integrations', href: '/dashboard/integrations' },
  { label: 'Projects', href: '/projects' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
];

const LANGUAGES = [
  { code: 'EN', value: 'en', label: 'English' },
  { code: 'HI', value: 'hi', label: 'हिन्दी' },
  { code: 'AR', value: 'ar', label: 'العربية' },
  { code: 'FR', value: 'fr', label: 'Français' },
  { code: 'ES', value: 'es', label: 'Español' },
  { code: 'DE', value: 'de', label: 'Deutsch' },
];

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" opacity="0.15" />
      <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="url(#logo-grad)" strokeWidth="2" fill="none" />
      <path d="M16 8V24M8 12L24 20M24 12L8 20" stroke="url(#logo-grad)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="3" fill="url(#logo-grad)" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('EN');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const langRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutsideProfile = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideProfile);
    return () => document.removeEventListener('mousedown', handleClickOutsideProfile);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Read initial theme from HTML
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light' || current === 'dark') setTheme(current);
    }
  }, []);

  // Handle Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  // Initialize Language from Cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const gtCookie = cookies.find(c => c.trim().startsWith('googtrans='));
    if (gtCookie) {
      const val = gtCookie.split('=')[1]; // e.g. /en/hi
      if (val && val !== 'null') {
        const langTarget = val.split('/')[2];
        const match = LANGUAGES.find(l => l.value === langTarget);
        if (match) setSelectedLang(match.code);
      }
    }
  }, []);

  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    setSelectedLang(lang.code);
    setLangOpen(false);
    
    // Set Google Translate Cookie
    const domain = window.location.hostname;
    if (lang.value === 'en') {
      // Clear cookie to revert to original
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    } else {
      // Set to new language (from 'en' to target)
      document.cookie = `googtrans=/en/${lang.value}; path=/`;
      document.cookie = `googtrans=/en/${lang.value}; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/en/${lang.value}; path=/; domain=${domain}`;
    }
    
    // Reload to apply translation
    window.location.reload();
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'py-2 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] shadow-lg'
            : 'py-4 bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="DevFort Home">
            <LogoIcon />
            <span className="text-xl font-bold gradient-text tracking-tight group-hover:opacity-80 transition-opacity">
              DevFort Analytics
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-primary font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                    after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                    after:h-0.5 after:bg-primary after:rounded-full
                    after:transition-all after:duration-300
                    ${isActive ? 'after:w-3/4' : 'after:w-0 hover:after:w-3/4'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language selector (desktop) */}
            <div ref={langRef} className="relative hidden lg:block group">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="
                  flex items-center gap-2 px-3 py-2.5 rounded-full text-xs font-bold uppercase
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer
                  bg-[var(--header-bg)]/50 backdrop-blur border border-[var(--border)]
                "
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                <GlobeIcon />
                <span id="current-lang-display">{selectedLang}</span>
              </button>

              <div
                className={`
                  absolute right-0 top-full mt-2 py-2 w-32 rounded-xl
                  bg-[var(--card)] border border-[var(--glass-border)] shadow-xl
                  transition-all duration-200 z-50
                  ${langOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}
                role="listbox"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={selectedLang === lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`
                      w-full text-left px-4 py-2 text-xs transition-colors duration-150 cursor-pointer
                      ${selectedLang === lang.code
                        ? 'text-primary bg-primary/10'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted)]'
                      }
                    `}
                  >
                    {lang.label} ({lang.code})
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="
                p-2.5 rounded-xl flex items-center gap-2
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer
              "
              aria-label="Search website"
            >
              <SearchIcon />
              <span className="hidden xl:inline-block text-xs border border-[var(--border)] rounded px-1.5 py-0.5 opacity-60">Ctrl+K</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="
                p-2.5 rounded-xl
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer
              "
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Session Actions (desktop) */}
            {status === 'authenticated' ? (
              <div className="hidden lg:flex items-center gap-3 relative" ref={profileRef}>
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold cursor-pointer border-2 border-[var(--glass-border)] hover:border-primary transition-all shadow-md"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>

                {profileOpen && (
                  <div className="absolute top-14 right-0 w-48 bg-[var(--card)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-[var(--glass-border)]">
                      <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{session?.user?.email}</p>
                    </div>
                    {session?.user?.role === 'SUPER-ADMIN' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--muted)] hover:text-white transition-colors">
                      Profile Settings
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full text-left block px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="
                    px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)]
                    hover:text-[var(--text-primary)] transition-colors
                  "
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="
                    inline-flex items-center gap-2
                    px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-primary to-[#2563EB]
                    hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]
                    transition-all duration-300 hover:-translate-y-0.5
                  "
                >
                  Get Started
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="xl:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-[300px] max-w-[85vw] z-50
          bg-[var(--card)] border-l border-[var(--border)]
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Mobile navigation"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <LogoIcon />
            <span className="text-lg font-bold gradient-text">DevForge</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mobile nav links */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="
                flex items-center px-6 py-3.5 text-base font-medium
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                hover:bg-[var(--muted)] transition-all duration-200
              "
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile bottom actions */}
        <div className="p-5 border-t border-[var(--border)] space-y-3">
          {/* Language selector mobile */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <GlobeIcon />
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-sm flex-1 cursor-pointer outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code} — {lang.label}
                </option>
              ))}
            </select>
          </div>

          {status === 'authenticated' ? (
            <div className="space-y-2 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{session?.user?.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{session?.user?.email}</p>
                </div>
              </div>
              
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="
                  flex items-center justify-center gap-2 w-full
                  px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)]
                  border border-[var(--glass-border)] bg-[var(--card)]/50
                  transition-all duration-200
                "
              >
                Profile Settings
              </Link>
              {session?.user?.role === 'SUPER-ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="
                    flex items-center justify-center gap-2 w-full
                    px-4 py-3 rounded-xl text-sm font-semibold text-amber-500
                    border border-amber-500/30 bg-amber-500/10
                    transition-all duration-200
                  "
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="
                  flex items-center justify-center gap-2 w-full
                  px-4 py-3 rounded-xl text-sm font-semibold text-rose-500
                  border border-rose-500/30 bg-rose-500/10
                  transition-all duration-200 cursor-pointer
                "
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="
                  flex items-center justify-center w-full py-2.5 text-sm font-medium text-[var(--text-secondary)]
                  hover:text-[var(--text-primary)] transition-colors
                "
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="
                  flex items-center justify-center gap-2 w-full
                  px-5 py-3 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-primary to-[#2563EB]
                  hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]
                  transition-all duration-300
                "
              >
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* GLOBAL SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-32">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSearchOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down">
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
              <SearchIcon />
              <input 
                ref={searchInputRef}
                type="text" 
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--text-muted)] text-lg"
                placeholder="Search services, projects, docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--foreground)] px-2 py-1 text-xs border border-[var(--border)] rounded"
              >
                ESC
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {searchQuery.length > 0 ? (
                <div className="p-2 space-y-1">
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">Results</div>
                  {/* Dummy results for simulation */}
                  <Link href="/services/data-analytics" onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M18 9l-5 5-4-4-3 3"/></svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)] text-sm">Data Analytics</div>
                      <div className="text-xs text-[var(--text-muted)]">Service &bull; Predictive modeling and insights</div>
                    </div>
                  </Link>
                  <Link href="/lab" onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/></svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)] text-sm">Data Lab Simulator</div>
                      <div className="text-xs text-[var(--text-muted)]">Playground &bull; Test AI models client-side</div>
                    </div>
                  </Link>
                  <Link href="/pricing" onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--foreground)] text-sm">Pricing & Plans</div>
                      <div className="text-xs text-[var(--text-muted)]">Page &bull; View subscription tiers</div>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="py-12 text-center text-[var(--text-muted)] text-sm">
                  Start typing to search...
                </div>
              )}
            </div>
            
            <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--muted)] flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">Search powered by DevForge AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
