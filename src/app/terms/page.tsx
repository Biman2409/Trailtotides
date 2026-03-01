import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using TRAIL TO TIDES (the "Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time; continued use of the Platform after changes constitutes acceptance.`,
  },
  {
    title: "2. Use of the Platform",
    content: `TRAIL TO TIDES is an adventure discovery and information platform. You may use the Platform for personal, non-commercial purposes only. You may not use the Platform to scrape content, spam users, impersonate other individuals, or engage in any activity that violates applicable law. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "3. Accuracy of Information",
    content: `We strive to provide accurate, up-to-date information about adventures and operators on our platform. However, conditions change — trail status, operator credentials, and pricing are subject to change without notice. TRAIL TO TIDES is not responsible for any inaccuracies in content. Always verify critical information (especially safety and permits) directly with operators before undertaking any adventure.`,
  },
  {
    title: "4. Adventure Risk Acknowledgement",
    content: `Adventure activities involve inherent risks including, but not limited to, physical injury, illness, death, property damage, and environmental hazards. TRAIL TO TIDES provides information only — we do not operate, organise, or oversee any adventure activity. Any adventure you undertake is at your own risk. You are responsible for assessing your own fitness, skills, and the suitability of any adventure for your circumstances.`,
  },
  {
    title: "5. Third-Party Operators",
    content: `TRAIL TO TIDES lists third-party adventure operators. Our verification process provides a reasonable level of due diligence, but the "Verified" badge is not a guarantee of safety or quality. Any contract, booking, or payment made with an operator is directly between you and that operator. We are not a party to such contracts and accept no liability for the actions or omissions of listed operators.`,
  },
  {
    title: "6. User-Generated Content",
    content: `If you submit stories, reviews, or other content to the Platform, you grant TRAIL TO TIDES a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with the Platform. You represent that you have all necessary rights to the content you submit and that it does not infringe any third-party rights.`,
  },
  {
    title: "7. Intellectual Property",
    content: `All content on TRAIL TO TIDES — including text, graphics, adventure data, and design — is the property of TRAIL TO TIDES or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
        {
          title: "8. Compass.AI Features",
          content: `TRAIL TO TIDES uses Compass.AI (powered by OpenAI's language model technology) to provide adventure recommendations. Recommendations are generated automatically and may not always be accurate, appropriate, or safe for your specific circumstances. Always exercise your own judgement and verify information before acting on any AI-generated recommendation.`,
        },

  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, TRAIL TO TIDES shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any adventure activity. Our aggregate liability to you for any claim shall not exceed the amount you paid to TRAIL TO TIDES in the 12 months preceding the claim (if any).`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.`,
  },
  {
    title: "11. Contact",
    content: `For questions about these terms, contact us at hello@trailtotides.com.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#111820]">
      <Navbar />

      <section className="pt-32 pb-14 px-6 lg:px-8 bg-[#1a1f2e]">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Legal</p>
          <h1 className="text-white text-5xl font-bold tracking-tight mb-4">Terms of Use</h1>
          <p className="text-white/45 text-base">Last updated: February 2026</p>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/60 text-base leading-relaxed mb-12">
            Please read these Terms of Use carefully before using the TRAIL TO TIDES platform. By using our platform, you agree to these terms.
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
