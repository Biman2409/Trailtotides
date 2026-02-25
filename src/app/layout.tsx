import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import Script from "next/script";
import { CompareProvider } from "@/context/CompareContext";
import CompareDrawer from "@/components/ui/custom/CompareDrawer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Trail to Tides — India's Adventure Discovery Platform",
  description:
    "Discover treks, rides, and wild experiences across India — curated, verified, and beautifully mapped. From the Himalayas to the Andamans.",
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
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
