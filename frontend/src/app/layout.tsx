import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProposifyAI",
  description: "Elevate your business proposals with AI-powered solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Navigation />
        <div className="pt-16 min-h-[calc(100vh-4rem)]">
          <div className="min-h-full bg-gradient-to-r from-[#4ca5ff] to-[#b673f8]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
