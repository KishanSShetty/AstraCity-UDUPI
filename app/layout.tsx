import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
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
      <body className={`${spaceGrotesk.className} ${spaceMono.variable} bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-emerald-500/20 overflow-hidden`}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <TopHeader />
                <main className="flex-1 overflow-y-auto bg-slate-50/60">
                  {children}
                </main>
              </div>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
