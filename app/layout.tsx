import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://verquo.com"),
  title: {
    default: "Verquo - AI-Powered Interview Marketplace",
    template: "%s | Verquo",
  },
  description: "Verquo is an AI-powered technical interviewing platform. Take a rigorous interview once, and share verified technical assessments directly with recruiters.",
  keywords: [
    "AI interview",
    "technical assessment",
    "verified hiring",
    "developer hiring",
    "coding interview",
    "Verquo",
    "software engineer job search",
    "AI coding test",
    "interview marketplace"
  ],
  authors: [{ name: "Verquo Team" }],
  openGraph: {
    title: "Verquo - AI-Powered Interview Marketplace",
    description: "Take one AI-powered technical interview, and share verified technical assessments directly with recruiters.",
    url: "https://verquo.com",
    siteName: "Verquo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verquo - AI-Powered Interview Marketplace",
    description: "Take one AI-powered technical interview, and share verified technical assessments directly with recruiters.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
