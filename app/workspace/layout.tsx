import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect workspace route - redirect to home if not authenticated
  if (!session?.user) {
    redirect('/');
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
