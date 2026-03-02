import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — Trail to Tides",
  description:
    "Get in touch with Trail to Tides — for general enquiries, listing an adventure, partnerships, press, or feedback.",
  openGraph: {
    title: "Contact — Trail to Tides",
    description: "Get in touch with Trail to Tides — for general enquiries, listing an adventure, partnerships, press, or feedback.",
    url: "https://trailtotides.com/contact",
    images: [{ url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=90", width: 1200, height: 630 }],
  },
  alternates: { canonical: "https://trailtotides.com/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
