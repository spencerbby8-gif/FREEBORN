import type { Metadata } from "next";
import { brand, buildCssVariables } from "@freeborn/shared";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.name} — Premium dating, built with intention`,
  description: brand.manifesto,
  metadataBase: new URL("https://freeborn.app"),
  openGraph: {
    title: `${brand.name} — Premium dating, built with intention`,
    description: brand.manifesto,
    url: "https://freeborn.app",
    siteName: brand.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Premium dating, built with intention`,
    description: brand.manifesto,
  },
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
