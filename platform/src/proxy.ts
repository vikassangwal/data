import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect /dashboard routes
  if (nextUrl.pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    
    // Onboarding Redirect
    const profession = (req.auth?.user as any)?.profession;
    const isOnboardingRoute = nextUrl.pathname === '/dashboard/onboarding';
    
    if (!profession && !isOnboardingRoute) {
      return NextResponse.redirect(new URL('/dashboard/onboarding', nextUrl));
    }
    if (profession && isOnboardingRoute) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  // Protect /admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl));
    }
    // Also check if user has 'ADMIN' role
    const role = (req.auth?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure the paths where middleware will run
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
