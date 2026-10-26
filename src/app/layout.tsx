import type { Metadata } from "next";
import { DM_Sans, Fraunces, Great_Vibes, Caveat, Permanent_Marker } from "next/font/google";
import "./globals.css";
import CompareWrapper from "@/components/ui/custom/CompareWrapper";
import NavigationScrollReset from "@/components/ui/custom/NavigationScrollReset";
import MobileBottomNav from "@/components/ui/custom/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import VerifiedToast from "@/components/VerifiedToast";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

const greatVibes = Great_Vibes({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400"],
});

// A bolder, more legible script — for small-scale personal-touch text (author
// role labels etc.) where Great Vibes' thin strokes disappear at tiny sizes.
const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Hand-painted marker for accent words in display headlines (hero "Trail" / "Tides").
const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: ["400"],
});

// Editorial display serif for h1/h2 only; DM Sans stays for body and UI.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  // 400 is the light display weight the adventure page's calm headings use
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const BASE_URL = "https://www.trailtotides.com";
const OG_IMAGE = `${BASE_URL}/opengraph-image`;

export const metadata: Metadata = {
  title: {
    default: "Trail to Tides — Find, Compare & Book Adventures in India",
    template: "%s | Trail to Tides",
  },
  description:
    "Find, compare and book adventures across India — matched to your fitness, picked by Compass.AI and run by verified operators.",
  metadataBase: new URL(BASE_URL),
  keywords: [
    "adventure travel India",
    "trekking India",
    "Himalayan treks",
    "find adventures India",
    "compare adventures India",
    "adventures matched to your fitness",
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
    "ACE™ adventure rating",
    "Compass.AI",
    "Trail to Tides",
  ],
  authors: [{ name: "Trail to Tides", url: BASE_URL }],
  creator: "Trail to Tides",
  publisher: "Trail to Tides",
  category: "Travel & Adventure",
  // /icon, /apple-icon, and /favicon.ico are auto-detected from their route
  // files (src/app/icon.tsx, apple-icon.tsx, favicon.ico) — only the SVG
  // fallback needs declaring here since that convention doesn't cover it.
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Trail to Tides — Find, Compare & Book Adventures in India",
    description:
      "Find, compare and book adventures across India — matched to your fitness, picked by Compass.AI and run by verified operators.",
    type: "website",
    url: BASE_URL,
    siteName: "Trail to Tides",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trail to Tides — Find, Compare & Book Adventures in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trailtotides",
    creator: "@trailtotides",
    title: "Trail to Tides — Find, Compare & Book Adventures in India",
    description:
      "Find, compare and book adventures across India — matched to your fitness, picked by Compass.AI and run by verified operators.",
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
  // The real Search Console token, set in Vercel; no tag at all until then
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon" />
      </head>
        <body className={`${dmSans.variable} ${fraunces.variable} ${greatVibes.variable} ${caveat.variable} ${permanentMarker.variable} antialiased`} style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
        {/* A plain tag, not next/script, so it's in the server HTML crawlers read first */}
        <script
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
                  url: `${BASE_URL}/icon`,
                  width: 512,
                  height: 512,
                },
                image: OG_IMAGE,
                description:
                  "Find, compare and book adventures across India — matched to your fitness, picked by Compass.AI and run by verified operators.",
                email: "hello@trailtotides.com",
                foundingDate: "2024",
                areaServed: {
                  "@type": "GeoShape",
                  name: "Indian Subcontinent",
                },
                knowsAbout: [
                  "Trekking",
                  "Himalayan treks",
                  "Mountaineering",
                  "Motorcycle touring",
                  "Cycling",
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
            ]),
          }}
        />
        <Suspense fallback={null}>
          <NavigationScrollReset />
        </Suspense>
        <CompareWrapper>
            {children}
          </CompareWrapper>
          <MobileBottomNav />
          <Toaster position="bottom-center" richColors />
          <VerifiedToast />
        </ThemeProvider>
      </body>
    </html>
  );
}
