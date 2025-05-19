import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'guest' | 'regular' | 'premium';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      subscriptionPeriodEnd?: Date;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionPeriodEnd?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionPeriodEnd?: Date;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        // Ensure subscriptionPlan and subscriptionStatus are undefined if null
        return {
          ...user,
          type: 'regular',
          subscriptionPlan: user.subscriptionPlan ?? undefined,
          subscriptionStatus: user.subscriptionStatus ?? undefined,
          subscriptionPeriodEnd: user.subscriptionPeriodEnd ?? undefined,
        };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.subscriptionPlan = user.subscriptionPlan;
        token.subscriptionStatus = user.subscriptionStatus;
        token.subscriptionPeriodEnd = user.subscriptionPeriodEnd;
      }

      return token;
    },    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        session.user.subscriptionPlan = token.subscriptionPlan as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.subscriptionPeriodEnd = token.subscriptionPeriodEnd as Date;
      }
      
      return session;
    },
  },
});
