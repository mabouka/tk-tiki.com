import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';

const backendApiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: {
        appleId: process.env.APPLE_CLIENT_ID || '',
        teamId: process.env.APPLE_TEAM_ID || '',
        privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        keyId: process.env.APPLE_KEY_ID || ''
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user?.email) {
        const response = await fetch(`${backendApiUrl}/api/auth/oauth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            email: user.email,
            name: user.name
          })
        });

        if (response.ok) {
          const data = await response.json();
          token.backendToken = data.token;
          token.userRole = data.user?.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken as string | undefined;
      session.userRole = token.userRole as string | undefined;
      return session;
    }
  }
};
