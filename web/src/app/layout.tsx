import type { Metadata, Viewport } from "next";
import { brand, buildCssVariables } from "@freeborn/shared";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://freeborn.app"),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.manifesto,
  applicationName: brand.name,
  keywords: [
    "dating app",
    "premium dating",
    "intentional dating",
    "meaningful connections",
    "relationships",
    "serious dating",
    "freeborn",
  ],
  authors: [{ name: "Freeborn" }],
  creator: "Freeborn",
  publisher: "Freeborn",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.manifesto,
    url: "https://freeborn.app",
    siteName: brand.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.manifesto,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--color-night)]">
      <body className="min-h-screen bg-[var(--color-night)] text-[var(--color-pearl)] antialiased">
        <style dangerouslySetInnerHTML={{ __html: buildCssVariables() }} />
        {children}
      </body>
    </html>
  );
}
