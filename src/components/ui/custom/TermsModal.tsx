"use client";

import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

const TERMS_SECTIONS = [
  { title: "1. Acceptance of Terms", content: `By accessing or using TRAIL TO TIDES (the "Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time; continued use of the Platform after changes constitutes acceptance.` },
  { title: "2. Use of the Platform", content: `TRAIL TO TIDES is an adventure discovery and information platform. You may use the Platform for personal, non-commercial purposes only. You may not use the Platform to scrape content, spam users, impersonate other individuals, or engage in any activity that violates applicable law. We reserve the right to suspend or terminate accounts that violate these terms.` },
  { title: "3. Accuracy of Information", content: `We strive to provide accurate, up-to-date information about adventures and operators on our platform. However, conditions change — trail status, operator credentials, and pricing are subject to change without notice. TRAIL TO TIDES is not responsible for any inaccuracies in content. Always verify critical information (especially safety and permits) directly with operators before undertaking any adventure.` },
  { title: "4. Adventure Risk Acknowledgement", content: `Adventure activities involve inherent risks including, but not limited to, physical injury, illness, death, property damage, and environmental hazards. TRAIL TO TIDES provides information only — we do not operate, organise, or oversee any adventure activity. Any adventure you undertake is at your own risk. You are responsible for assessing your own fitness, skills, and the suitability of any adventure for your circumstances.` },
  { title: "5. Third-Party Operators", content: `TRAIL TO TIDES lists third-party adventure operators. Our verification process provides a reasonable level of due diligence, but the "Verified" badge is not a guarantee of safety or quality. Any contract, booking, or payment made with an operator is directly between you and that operator. We are not a party to such contracts and accept no liability for the actions or omissions of listed operators.` },
  { title: "6. User-Generated Content", content: `If you submit stories, reviews, or other content to the Platform, you grant TRAIL TO TIDES a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content in connection with the Platform. You represent that you have all necessary rights to the content you submit and that it does not infringe any third-party rights.` },
  { title: "7. Intellectual Property", content: `All content on TRAIL TO TIDES — including text, graphics, adventure data, and design — is the property of TRAIL TO TIDES or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.` },
  { title: "8. Compass.AI Features", content: `TRAIL TO TIDES uses Compass.AI (powered by OpenAI's language model technology) to provide adventure recommendations. Recommendations are generated automatically and may not always be accurate, appropriate, or safe for your specific circumstances. Always exercise your own judgement and verify information before acting on any AI-generated recommendation.` },
  { title: "9. Limitation of Liability", content: `To the maximum extent permitted by applicable law, TRAIL TO TIDES shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any adventure activity. Our aggregate liability to you for any claim shall not exceed the amount you paid to TRAIL TO TIDES in the 12 months preceding the claim (if any).` },
  { title: "10. Governing Law", content: `These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.` },
  { title: "11. Contact", content: `For questions about these terms, contact us at hello@trailtotides.com.` },
];

const PRIVACY_SECTIONS = [
  { title: "1. Information We Collect", content: `When you create an account, we collect your name, email address, and optionally your phone number. When you use our platform, we may collect usage data including pages visited, features used, and search queries to improve the service. We do not collect payment information — any bookings are made directly with adventure operators.` },
  { title: "2. How We Use Your Information", content: `We use your information to operate and improve TRAIL TO TIDES, personalise your adventure recommendations, communicate with you about your account and new features, and — with your permission — send you a newsletter about new adventures and stories. We never sell your data to third parties.` },
  { title: "3. Data Storage & Security", content: `Your data is stored securely using Supabase (PostgreSQL), with row-level access controls. Passwords are hashed and never stored in plain text. We use HTTPS on all connections. While we take reasonable precautions, no internet service can guarantee absolute security.` },
  { title: "4. Cookies", content: `We use cookies to maintain your login session and remember your preferences. We do not use advertising cookies or cross-site tracking cookies. You can delete cookies in your browser settings at any time, which will log you out of the platform.` },
  { title: "5. Third-Party Services", content: `We use OpenAI's API to power the Compass.AI adventure discovery engine. Queries you send to Compass.AI are processed by OpenAI and subject to their privacy policy. We use Supabase for authentication and database services. We use Unsplash for imagery, which is served directly from their CDN.` },
  { title: "6. Your Rights", content: `You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@trailtotides.com. We will respond within 30 days. If you delete your account, your personal data is removed from our systems within 30 days, except where retention is required by law.` },
  { title: "7. Children", content: `TRAIL TO TIDES is not intended for use by persons under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us personal information, please contact us and we will delete it.` },
  { title: "8. Changes to This Policy", content: `We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of the platform after changes constitutes acceptance of the updated policy. The date at the bottom of this page reflects when the policy was last revised.` },
  { title: "9. Contact", content: `For privacy-related enquiries, contact us at hello@trailtotides.com or write to: TRAIL TO TIDES, Mumbai, India.` },
];

interface Props {
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ onAccept, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (atBottom) setHasScrolledToBottom(true);
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
           style={{ maxHeight: "90vh", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Terms & Privacy Policy</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Please read carefully before agreeing</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-8"
        >
          {/* Terms of Use */}
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Terms of Use</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              Please read these Terms of Use carefully before using the TRAIL TO TIDES platform. By using our platform, you agree to these terms.
            </p>
            <div className="space-y-5">
              {TERMS_SECTIONS.map((s) => (
                <div key={s.title}>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t" style={{ borderColor: "var(--border-subtle)" }} />

          {/* Privacy Policy */}
          <div>
            <p className="text-[#ff5100] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Privacy Policy</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              TRAIL TO TIDES is committed to protecting your privacy. This policy explains what information we collect, how we use it, and what rights you have.
            </p>
            <div className="space-y-5">
              {PRIVACY_SECTIONS.map((s) => (
                <div key={s.title}>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom padding so scroll indicator triggers cleanly */}
          <div className="h-4" />
        </div>

        {/* Scroll hint — fades out once at bottom */}
        {!hasScrolledToBottom && (
          <div className="absolute bottom-[72px] left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-surface)] to-transparent pointer-events-none flex items-end justify-center pb-2">
            <p className="text-[10px] font-medium tracking-wide animate-pulse" style={{ color: "var(--text-tertiary)" }}>Scroll to the bottom to agree</p>
          </div>
        )}

        {/* Footer / Accept button */}
        <div className="px-6 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
          <button
            onClick={() => { onAccept(); onClose(); }}
            disabled={!hasScrolledToBottom}
            className="w-full flex items-center justify-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            I have read and agree to the Terms & Privacy Policy
          </button>
          {!hasScrolledToBottom && (
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              Read to the end to enable this button
            </p>
          )}
        </div>
      </div>
    </div>
  );
}