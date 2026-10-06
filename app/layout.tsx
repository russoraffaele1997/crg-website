import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

// Body / UI font — geometric sans-serif, clean and professional
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display / heading font — architectural, bold, modern
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves relative URLs (Open Graph image, icons) against the real domain.
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | CRG - Crafted Residential Group",
    default: "CRG | Crafted Residential Group — Sviluppo Immobiliare Premium",
  },
  description:
    "CRG | Crafted Residential Group sviluppa progetti immobiliari residenziali, commerciali e industriali, trasformando aree e fabbricati in spazi moderni, efficienti e sostenibili.",
  keywords:
    "CRG, Crafted Residential Group, sviluppo immobiliare, costruzioni, residenziale, Casoria, Napoli, Palazzo Rue",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "CRG | Crafted Residential Group",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${inter.variable} ${sora.variable} antialiased bg-cream`}>
        {children}
      </body>
    </html>
  );
}
