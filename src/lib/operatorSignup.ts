import { z } from "zod";

// Every operator sign-up field, checked before an account is created or an email is sent
export function operatorSignupSchema(supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") {
  const logoPrefix = `${supabaseUrl}/storage/v1/object/public/operator-profiles/`;
  return z.object({
    contact_name: z.string().trim().min(2, "Enter your name.").max(80, "Keep your name under 80 characters."),
    company_name: z.string().trim().min(2, "Enter your company name.").max(120, "Keep the company name under 120 characters."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
    country_code: z.string().regex(/^\+\d{1,4}$/, "Choose a country code."),
    phone: z.string().transform((s) => s.replace(/[\s-]/g, "")).pipe(z.string().regex(/^\d{6,15}$/, "Enter a phone number of 6 to 15 digits.")),
    website: z.union([
      z.literal(""),
      z.string().trim().max(300).refine((u) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(u), "Enter a website starting with https://"),
    ]),
    // Only a logo uploaded through /api/operator-logo, never an image hosted elsewhere
    logo_url: z.union([z.literal(""), z.string().max(500).refine((u) => !!supabaseUrl && u.startsWith(logoPrefix), "Upload the logo again.")]),
    password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  });
}
