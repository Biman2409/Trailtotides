import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `When you create an account, we collect your name, email address, and optionally your phone number. When you use our platform, we may collect usage data including pages visited, features used, and search queries to improve the service. We do not collect payment information — any bookings are made directly with adventure operators.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to operate and improve Trail to Tides, personalise your adventure recommendations, communicate with you about your account and new features, and — with your permission — send you a newsletter about new adventures and stories. We never sell your data to third parties.`,
  },
  {
    title: "3. Data Storage & Security",
    content: `Your data is stored securely using Supabase (PostgreSQL), with row-level access controls. Passwords are hashed and never stored in plain text. We use HTTPS on all connections. While we take reasonable precautions, no internet service can guarantee absolute security.`,
  },
  {
    title: "4. Cookies",
    content: `We use cookies to maintain your login session and remember your preferences. We do not use advertising cookies or cross-site tracking cookies. You can delete cookies in your browser settings at any time, which will log you out of the platform.`,
  },
  {
    title: "5. Third-Party Services",
    content: `We use OpenAI's API to power the Compass AI adventure finder. Queries you send to Compass AI are processed by OpenAI and subject to their privacy policy. We use Supabase for authentication and database services. We use Unsplash for imagery, which is served directly from their CDN.`,
  },
  {
    title: "6. Your Rights",
    content: `You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@trailtotides.com. We will respond within 30 days. If you delete your account, your personal data is removed from our systems within 30 days, except where retention is required by law.`,
  },
  {
    title: "7. Children",
    content: `Trail to Tides is not intended for use by persons under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us personal information, please contact us and we will delete it.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of the platform after changes constitutes acceptance of the updated policy. The date at the bottom of this page reflects when the policy was last revised.`,
  },
  {
    title: "9. Contact",
    content: `For privacy-related enquiries, contact us at hello@trailtotides.com or write to: Trail to Tides, Mumbai, India.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      <section className="pt-32 pb-14 px-6 lg:px-8 bg-[#1a1f2e]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5722] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="text-white text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-white/45 text-base">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/60 text-base leading-relaxed mb-12">
            Trail to Tides (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains what information we collect, how we use it, and what rights you have. Please read it carefully.
          </p>
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-white text-xl font-semibold mb-4">{section.title}</h2>
                <p className="text-white/55 text-base leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
