import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import Script from "next/script";
import CompareWrapper from "@/components/ui/custom/CompareWrapper";
import { CompareProvider } from "@/contexts/CompareContext";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TRAIL TO TIDES — India's Adventure Discovery Platform",
    description:
      "Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision — for you.",
    metadataBase: new URL("https://trailtotides.com"),
    openGraph: {
      title: "TRAIL TO TIDES — India's Adventure Discovery Platform",
      description: "Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision — for you.",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630 }],
  },
    twitter: {
    card: "summary_large_image",
    title: "TRAIL TO TIDES",
    description: "Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision — for you.",
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
