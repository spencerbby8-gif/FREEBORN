import type { Metadata, Viewport } from "next";
import { brand, buildCssVariables } from "@freeborn/shared";
import "./globals.css";

const siteUrl = "https://freeborn.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brand.seoTitle,
    template: `%s · ${brand.name}`,
  },
  description: brand.seoDescription,
  applicationName: brand.name,
  keywords: [...brand.seoKeywords],
  authors: [{ name: "Freeborn" }],
  creator: "Freeborn",
  publisher: "Freeborn",
  category: "Relationship Platform",
  alternates: {
    canonical: siteUrl,
  },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: brand.seoTitle,
    description: brand.seoDescription,
    url: siteUrl,
    siteName: brand.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.seoTitle,
    description: brand.seoDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
