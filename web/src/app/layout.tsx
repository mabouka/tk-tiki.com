import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import { HeaderNav } from '../components/header-nav';
import { AppSessionProvider } from '../components/session-provider';
import { AuthSessionBridge } from '../components/auth-session-bridge';

export const metadata = {
  title: 'TK Boards',
  description: 'NFC board verification and ownership platform'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppSessionProvider>
          <AuthSessionBridge />
          <header className="header">
            <div className="container nav">
              <Link className="brand" href="/">
                TK BOARDS
              </Link>
              <HeaderNav />
            </div>
          </header>
          <main className="main container">{children}</main>
        </AppSessionProvider>
      </body>
    </html>
  );
}
