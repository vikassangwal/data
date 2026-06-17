'use client';

import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden pt-20">
      <Container className="relative z-10 text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-foreground">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have the required permissions to access the Admin Panel. 
          Please make sure you are logged in with an Administrator account.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" fullWidth>
              Log in as Admin
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" fullWidth>
              Return to Homepage
            </Button>
          </Link>
        </div>
      </Container>
    </main>
  );
}
