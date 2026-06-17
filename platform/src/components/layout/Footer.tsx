'use client';

import { useState } from 'react';
import Link from 'next/link';

const FOOTER_LINKS = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Skills', href: '/skills' },
    { label: 'Formula Bot', href: '/formula-bot' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  services: [
    { label: 'Data Analytics', href: '/services#analytics' },
    { label: 'Dashboard Development', href: '/services#dashboards' },
    { label: 'AI Agent Services', href: '/services#ai-agents' },
    { label: 'Business Intelligence', href: '/services#bi' },
    { label: 'Web Automation', href: '/services#automation' },
    { label: 'Custom Software', href: '/services#software' },
  ],
};

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-error inline-block">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[var(--card)] border-t border-[var(--border)]">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-16">
          {/* Column 1 — About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="footer-logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="0.5" stopColor="#06B6D4" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#footer-logo)" opacity="0.15" />
                <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="url(#footer-logo)" strokeWidth="2" fill="none" />
                <circle cx="16" cy="16" r="3" fill="url(#footer-logo)" />
              </svg>
              <span className="text-lg font-bold gradient-text">DevForge</span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              Transforming businesses through AI-powered development, data analytics, and intelligent automation. Building the future, one solution at a time.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <GitHubIcon />, label: 'GitHub', href: 'https://github.com' },
                { icon: <LinkedInIcon />, label: 'LinkedIn', href: 'https://linkedin.com' },
                { icon: <TwitterIcon />, label: 'Twitter/X', href: 'https://x.com' },
                { icon: <EmailIcon />, label: 'Email', href: 'mailto:hello@devforge.dev' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="
                    p-2.5 rounded-xl
                    text-[var(--text-muted)] hover:text-primary
                    bg-[var(--muted)] hover:bg-primary/10
                    transition-all duration-300
                    hover:-translate-y-1
                  "
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="
                      text-sm text-[var(--text-secondary)] hover:text-primary
                      transition-colors duration-200
                      hover:translate-x-1 inline-block transition-transform
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="
                      text-sm text-[var(--text-secondary)] hover:text-primary
                      transition-colors duration-200
                      hover:translate-x-1 inline-block transition-transform
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact & Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Stay Updated
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Subscribe to our newsletter for the latest insights and updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="newsletter-input text-sm"
              />
              <button
                type="submit"
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-primary to-[#2563EB]
                  hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
                  transition-all duration-300 cursor-pointer
                "
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>

            {/* Contact info */}
            <div className="mt-6 space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                hello@devforge.dev
              </p>
              <p className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Remote — Worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--text-muted)] text-center sm:text-left">
            © {currentYear} DevForge. All rights reserved. Built with <HeartIcon /> and lots of coffee.
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              text-[var(--text-secondary)] hover:text-primary
              bg-[var(--muted)] hover:bg-primary/10
              transition-all duration-300
              hover:-translate-y-1 cursor-pointer
            "
            aria-label="Back to top"
          >
            <ArrowUpIcon />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}
