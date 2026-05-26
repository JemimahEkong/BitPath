import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Components/Providers";
import { auth } from "@/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BitPath - Learn Digital Skills. Earn Real Rewards.",
  description: "BitPath uses conversational AI and gamified rewards to make Bitcoin and financial education simple, engaging, and accessible.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the session on the server so SessionProvider hydrates with the
  // correct auth state on the very first render. Without this, useSession()
  // briefly returns null on every nav back to "/", causing CTA buttons to
  // flash "Get Started" before re-resolving to "Continue Learning".
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              history.scrollRestoration = 'manual';
              window.scrollTo(0, 0);
              document.documentElement.style.scrollBehavior = 'auto';
              requestAnimationFrame(function () {
                document.documentElement.style.scrollBehavior = '';
              });
            `,
          }}
        />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
