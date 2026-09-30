import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AIQueryBar from "@/components/layout/AIQueryBar";
import AuthWrapper from "@/components/layout/AuthWrapper";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

export const metadata = {
  title: 'VajraYield SWMS | Udupi CMC Digital Twin',
  description: 'Prescriptive Solid Waste Digital-Twin for Udupi City Municipal Council under SWM 2026 Rules',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} ${spaceMono.variable} bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased selection:bg-teal-500/30`}>
        <AuthWrapper>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <AIQueryBar />
        </AuthWrapper>
      </body>
    </html>
  );
}
