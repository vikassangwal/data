import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Define protected routes and their required roles
const protectedRoutes = [
  { path: '/admin', roles: ['SUPER-ADMIN', 'FINANCE', 'SUPPORT'] },
  { path: '/client', roles: ['SUPER-ADMIN', 'CLIENT'] },
  { path: '/analytics', roles: ['SUPER-ADMIN', 'ANALYST', 'CLIENT', 'USER'] },
];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Check if the route is protected
  const protectedRoute = protectedRoutes.find((route) =>
    nextUrl.pathname.startsWith(route.path)
  );

  if (protectedRoute) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole && !protectedRoute.roles.includes(userRole)) {
      // Redirect to unauthorized/home if role doesn't match
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
