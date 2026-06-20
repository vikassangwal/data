import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'devforge_super_secret_fallback_key_2026',
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  basePath: '/api/auth',
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || 'mock_google_id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'mock_google_secret',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.passwordHash) return null;

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in.');
        }

        const isMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
        
        if (isMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            planId: user.planId
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.planId = (user as any).planId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.planId = token.planId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
