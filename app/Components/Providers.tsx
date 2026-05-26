'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
  /**
   * Optional server-resolved session. When provided, `useSession()` returns
   * an authenticated state on the very first client render — this is what
   * prevents the "logged-out flash" on the landing page after navigating
   * back from /workspace.
   */
  session?: Session | null;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
