import type { Metadata } from "next";
import { DM_Sans, Dancing_Script } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import Script from "next/script";
import CompareWrapper from "@/components/ui/custom/CompareWrapper";

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const BASE_URL = "https://trailtotides.com";

export const metadata: Metadata = {
  title: "Trail to Tides — India's Adventure Discovery Platform",
  description:
    "Discover and compare epic adventures across the Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision.",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Trail to Tides — India's Adventure Discovery Platform",
    description:
      "Discover and compare epic adventures across the Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision.",
    type: "website",
    url: BASE_URL,
    siteName: "Trail to Tides",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90",
        width: 1200,
        height: 630,
        alt: "Trail to Tides — India's Adventure Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trail to Tides",
    description:
      "Discover and compare epic adventures across the Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision.",
    images: ["https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <Script
          id="org-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Trail to Tides",
                url: BASE_URL,
                logo: `${BASE_URL}/logo.svg`,
                sameAs: [],
                description:
                  "India's adventure discovery platform — handpicked adventures across the Indian Subcontinent, run by verified operators.",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Trail to Tides",
                url: BASE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="71778e38-df00-4ed2-869a-028f1f2862c1"
        />
        <CompareWrapper>
            {children}
            <VisualEditsMessenger />
          </CompareWrapper>
      </body>
    </html>
  );
}
