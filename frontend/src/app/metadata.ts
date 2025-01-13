import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ProposifyAI",
    template: "%s | ProposifyAI",
  },
  description: "Elevate your business proposals with AI-powered solutions",
  keywords: [
    "AI",
    "Proposals",
    "Business",
    "Automation",
    "Document Generation",
  ],
  authors: [{ name: "ProposifyAI Team" }],
  creator: "ProposifyAI",
  publisher: "ProposifyAI",
  robots: "index, follow",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4ca5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#b673f8" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/favicon.ico",
  },
};
