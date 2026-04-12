import type { Metadata } from "next";
import { DM_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import Script from "next/script";
import CompareWrapper from "@/components/ui/custom/CompareWrapper";
import NavigationScrollReset from "@/components/ui/custom/NavigationScrollReset";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

const greatVibes = Great_Vibes({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const BASE_URL = "https://trailtotides.com";
const OG_IMAGE = `${BASE_URL}/opengraph-image`;

export const metadata: Metadata = {
  title: {
    default: "Trail to Tides — India's Adventure Discovery Platform",
    template: "%s | Trail to Tides",
  },
  description:
    "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
  metadataBase: new URL(BASE_URL),
  keywords: [
    "adventure travel India",
    "trekking India",
    "Himalayan treks",
    "adventure discovery platform",
    "hiking India",
    "mountaineering India",
    "rock climbing India",
    "scrambling India",
    "mountain biking India",
    "cycling India",
    "kayaking India",
    "river rafting India",
    "scuba diving India",
    "snorkelling India",
    "paragliding India",
    "hot air balloon India",
    "skiing India",
    "snowboarding India",
    "ice climbing India",
    "ice skating India",
    "caving India",
    "jeep safari India",
    "surfing India",
    "skydiving India",
    "hang gliding India",
    "urban adventure India",
    "Ladakh trek",
    "Himachal Pradesh trek",
    "Uttarakhand trek",
    "adventure booking India",
    "verified adventure operators",
    "ACE adventure rating",
    "Compass AI",
    "Trail to Tides",
  ],
  authors: [{ name: "Trail to Tides", url: BASE_URL }],
  creator: "Trail to Tides",
  publisher: "Trail to Tides",
  category: "Travel & Adventure",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Trail to Tides — India's Adventure Discovery Platform",
    description:
      "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
    type: "website",
    url: BASE_URL,
    siteName: "Trail to Tides",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trail to Tides — India's Adventure Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trailtotides",
    creator: "@trailtotides",
    title: "Trail to Tides — India's Adventure Discovery Platform",
    description:
      "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "trail-to-tides-google-verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
        <body className={`${dmSans.variable} ${greatVibes.variable} antialiased`} style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
        <Script
          id="org-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${BASE_URL}/#organization`,
                name: "Trail to Tides",
                url: BASE_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${BASE_URL}/icon-512x512.png`,
                  width: 512,
                  height: 512,
                },
                image: OG_IMAGE,
                description:
                  "Discover, compare, and book elite adventures — matched to your body, mapped with precision, guided by AI, and led by India's most trusted operators.",
                email: "hello@trailtotides.com",
                foundingDate: "2024",
                areaServed: {
                  "@type": "GeoShape",
                  name: "Indian Subcontinent",
                },
                knowsAbout: [
                  "Trekking",
                  "Hiking",
                  "Mountain Biking",
                  "Rock Climbing",
                  "Kayaking",
                  "Adventure Travel",
                  "India Travel",
                ],
                sameAs: [
                  "https://instagram.com/trailtotides",
                  "https://twitter.com/trailtotides",
                  "https://youtube.com/@trailtotides",
                  "https://linkedin.com/company/trailtotides",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${BASE_URL}/#website`,
                name: "Trail to Tides",
                url: BASE_URL,
                publisher: { "@id": `${BASE_URL}/#organization` },
                inLanguage: "en-IN",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "SiteLinksSearchBox",
                url: BASE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${BASE_URL}/explore?q={search_term_string}`,
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
        <Suspense fallback={null}>
          <NavigationScrollReset />
        </Suspense>
        <CompareWrapper>
            {children}
            <VisualEditsMessenger />
          </CompareWrapper>
          <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
