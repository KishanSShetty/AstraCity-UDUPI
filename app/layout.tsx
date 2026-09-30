import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AIQueryBar from "@/components/layout/AIQueryBar";
import AuthWrapper from "@/components/layout/AuthWrapper";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: 'VajraYield SWMS | AstraCity Udupi Digital Twin',
  description: 'AI-Powered Municipal Solid Waste Management Digital Twin & Command Center for Udupi City Municipal Council',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} ${spaceMono.variable} bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-emerald-500/20`}>
        <AuthProvider>
          <LanguageProvider>
            <AuthWrapper>
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <AIQueryBar />
            </AuthWrapper>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
