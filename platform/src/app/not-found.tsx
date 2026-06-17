'use client';

import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-[120px] animate-float" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/8 blur-[100px] animate-pulse-glow" />

      <Container className="relative z-10 text-center">
        <ScrollReveal>
          {/* 404 Number */}
          <div className="relative inline-block mb-8">
            <span className="text-[10rem] sm:text-[14rem] font-bold leading-none gradient-text select-none opacity-90">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-[var(--text-muted)] text-lg max-w-md mx-auto mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }>
                Go Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Support</Button>
            </Link>
          </div>
        </ScrollReveal>
      </Container>
    </main>
  );
}
