import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import StoreProvider from "./storeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://verquo.com"),
  title: {
    default: "Verquo - AI-Powered Interview Marketplace",
    template: "%s | Verquo",
  },
  description:
    "Verquo is an AI-powered technical interviewing platform. Take a rigorous interview once, and share verified technical assessments directly with recruiters.",
  keywords: [
    "AI interview",
    "technical assessment",
    "verified hiring",
    "developer hiring",
    "coding interview",
    "Verquo",
    "software engineer job search",
    "AI coding test",
    "interview marketplace",
  ],
  authors: [{ name: "Verquo Team" }],
  openGraph: {
    title: "Verquo - AI-Powered Interview Marketplace",
    description:
      "Take one AI-powered technical interview, and share verified technical assessments directly with recruiters.",
    url: "https://verquo.com",
    siteName: "Verquo",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verquo - AI-Powered Interview Marketplace",
    description:
      "Take one AI-powered technical interview, and share verified technical assessments directly with recruiters.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "bg-card text-foreground border border-border rounded-md shadow-sm font-sans",
              title: "font-medium text-sm",
              description: "text-muted-foreground text-xs",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-secondary text-secondary-foreground",
              success: "border-success/40",
              error: "border-destructive/40",
            },
          }}
        />
      </body>
    </html>
  );
}
