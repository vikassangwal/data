import { handlers as authHandlers, auth as nextAuth, signIn as nextSignIn, signOut as nextSignOut } from '@/auth';

export const auth = nextAuth;
export const signIn = nextSignIn;
export const signOut = nextSignOut;
export const handlers = {
  GET: authHandlers.GET,
  POST: authHandlers.POST
};
