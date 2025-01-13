import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
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
        className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen`}
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
