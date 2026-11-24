// The Terms of Use and Privacy Policy, in one place: the /terms and /privacy pages and the
// sign-up pop-up (TermsModal) all read these, so the three can't drift apart again.
// Keep them true to what the site does: when a feature starts collecting or sharing something
// new, say so here and move LEGAL_UPDATED.
// Paragraphs inside a section are separated by a blank line ("\n\n").

export const LEGAL_UPDATED = "24 November 2026";
export const LEGAL_CONTACT = "hello@trailtotides.com";

export interface LegalSection { title: string; content: string }

export const TERMS_INTRO = `These terms cover your use of Trail to Tides at trailtotides.com (the "Platform"), run from Mumbai, India. By using the Platform or creating an account you agree to them. If you don't agree, please don't use it.`;

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. What Trail to Tides is",
    content: `Trail to Tides helps you find, compare and plan adventures in India and Nepal, and contact the operators who run them. We give information and introductions only. We don't run, organise or guide any adventure, and we don't take bookings or payments: any booking is made directly with the operator, on their terms.`,
  },
  {
    title: "2. Your account",
    content: `You can browse without an account. To save adventures, request quotes, write reviews or stories, or use Group Match, you need one, either with an email and password or by signing in with Google. Give accurate details, keep your password to yourself and tell us if you think someone else has used your account. One account per person; operators use an operator account.\n\nIf you're under 18, use the Platform only with a parent's or guardian's permission.`,
  },
  {
    title: "3. Using the Platform fairly",
    content: `Use the Platform for your own trip planning. Please don't scrape or copy its data in bulk, run automated tools against it or its Compass.AI chat, try to get around its security or rate limits, impersonate anyone, send spam or fake quote requests, or use it for anything unlawful. We may limit, suspend or close accounts that do.`,
  },
  {
    title: "4. Information on the Platform",
    content: `We work to keep adventure details, prices, seasons and operator information accurate, and show when prices were last checked. Conditions change, though: trails close, permits and prices change and operators update their trips. Treat what you read here as a starting point and confirm anything that matters, especially safety, permits, prices and dates, with the operator before you book.\n\nPrices are the operators' published starting prices and may not include taxes, travel to the start or optional extras. Itinerary days count the time on the trail; operators' trips are usually longer because they add travel days.`,
  },
  {
    title: "5. Maps, trails, grades and forecasts",
    content: `Trail maps, distances, heights, GPX downloads and the 3D "Fly the trail" view are drawn from OpenStreetMap, public elevation data and, in the 3D view, Mapbox's maps. Some stretches have no mapped path and are drawn along the terrain, and these are marked. Difficulty grades, ACE™ ratings, Adventure Matchmaker scores and weather forecasts are estimates to help you plan. None of them replaces a guide, a proper map, local advice or your own judgement on the day, and none of them is a navigation aid to rely on alone.`,
  },
  {
    title: "6. Adventure risk",
    content: `Adventure activities carry real risks, including altitude sickness, injury, illness, death, loss of property and dangerous weather. Whether an adventure suits you, and whether you're fit, healthy, equipped and insured for it, is your decision. Get medical advice if you have a health condition, and follow your guide's and operator's instructions.`,
  },
  {
    title: "7. Operators and quote requests",
    content: `Adventures are run by independent operators. "Verified" means our team has checked an operator's details; it isn't a guarantee of their safety, quality or conduct. Any contract, booking, payment, refund or complaint is between you and the operator, and we aren't a party to it.\n\nWhen you send a quote request, we pass your name, email address, chosen dates, group size and message to the operators you pick (see our Privacy Policy). Send requests only for trips you're genuinely considering. Operators reply to you directly.`,
  },
  {
    title: "8. Operator accounts",
    content: `If you sign up as an operator, the details, logos, photos and prices you give must be accurate and yours to use, and you agree to reply to quote requests promptly and honestly. We review operator accounts and listings before they go live and may decline, edit or remove them.`,
  },
  {
    title: "9. Reviews, stories and photos",
    content: `Reviews must be about your own experience, honest and fair. Stories and photos must be your own, or ones you have permission to share, and mustn't show people who haven't agreed to it. We moderate what's submitted and may edit it lightly for length and clarity, decline it or remove it. Notes written by our team are labelled as ours and aren't counted as traveller reviews.\n\nYou keep ownership of what you submit. You give Trail to Tides a non-exclusive, worldwide, royalty-free licence to show, adapt and share it on the Platform and in posts about the Platform, until you delete it or ask us to.`,
  },
  {
    title: "10. Compass.AI and the Adventure Matchmaker",
    content: `Compass.AI is a chat assistant powered by Google's Gemini models. The Adventure Matchmaker scores your answers against each adventure's ACE™ rating on our own servers. Both give automatic suggestions that can be wrong, out of date or unsuitable for you. Check anything important before acting on it.`,
  },
  {
    title: "11. Our content and other people's",
    content: `The Platform's text, design, adventure data, ACE™ ratings and trail work belong to Trail to Tides or to the people who licensed them to us. Don't copy or republish them in bulk without our written permission. Map data is © OpenStreetMap contributors; map tiles come from OpenFreeMap, satellite imagery from Esri and its partners, the 3D view's map from Mapbox, elevation from the public Terrain Tiles dataset, and some photos from Unsplash. Their credits are shown on the Platform and their own terms apply. Links to operators' and other sites are for your convenience; we don't control those sites.`,
  },
  {
    title: "12. Liability",
    content: `The Platform is provided as it is. As far as the law allows, Trail to Tides isn't liable for indirect or consequential losses, for anything an operator does or fails to do, or for injury, loss or damage on an adventure you choose to take. Our total liability to you for any claim is limited to the amount you've paid Trail to Tides in the 12 months before it, if any. Nothing in these terms limits liability that can't be limited by law.`,
  },
  {
    title: "13. Grievances and contact",
    content: `If you have a complaint about content on the Platform, how we've handled your data or your account, email ${LEGAL_CONTACT} with "Grievance" in the subject. We'll acknowledge it within 24 hours and aim to resolve it within 15 days.`,
  },
  {
    title: "14. Changes, and the law that applies",
    content: `We may update these terms as the Platform changes. The date at the top shows the latest version, and we'll email account holders about significant changes. These terms are governed by the laws of India, and the courts of Mumbai, Maharashtra have exclusive jurisdiction over any dispute.`,
  },
];

export const PRIVACY_INTRO = `This policy explains what Trail to Tides ("we", "us") collects when you use trailtotides.com, why, who else sees it, and what you can do about it. We collect what the Platform needs to work and we don't sell your data.`;

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. What we collect",
    content: `Your account: your name, email address and password (stored only as a secure hash), or, if you sign in with Google, the name, email address and profile photo Google shares with us. Optionally a username, profile photo and phone number.\n\nWhat you do with your account: your wishlist, saved searches and comparisons, adventures you mark as done, your Adventure Passport (rank, stamps and badges), Group Match groups and votes, reviews, stories and photos you submit, quote requests, messages you send through the contact form, and your settings.\n\nAdventure Matchmaker: your fitness answers and the eight capability scores worked out from them, and, only if you choose to answer them, a few health questions (see section 4).\n\nOperator accounts: company and contact details, logos, photos and listings.\n\nUsage: Vercel Web Analytics counts page views without cookies and without identifying you. We also count clicks through to operators' websites (which adventure, which operator and which button), with nothing that says who clicked. To stop abuse we briefly use your IP address to limit how often requests can be sent; our hosting provider keeps short-lived technical logs.\n\nWe don't collect payment details: you pay operators directly.`,
  },
  {
    title: "2. How we use it",
    content: `To run your account and the features you use; to show adventures, fit scores and safety notes that suit you; to pass your quote requests to the operators you choose; to email you about your account, your quote requests and, if you turn them on, wishlist alerts (when a saved adventure comes into season or its price drops); to answer messages; to moderate reviews and stories; and to keep the Platform secure and improve it. You can turn alerts off at any time in Settings.`,
  },
  {
    title: "3. Who sees your information",
    content: `Operators: when you request a quote, your name, email address, chosen dates, group size and message go to our inbox and to each operator you picked who has an approved account here. Each email goes separately, so operators don't see each other. Once an operator has your details, their own privacy policy applies. Clicking "Book" takes you to the operator's own website.\n\nOther people on the Platform: your username and profile photo appear with your reviews and published stories. Members of a Group Match you join see your name and capability scores. If you make your Adventure Passport public, anyone with the link can see your rank, stamps, badges and capability radar, but never your health answers.\n\nService providers who run parts of the Platform for us: Supabase (database, sign-in and file storage), Vercel (hosting and analytics), Resend (sending emails), Zoho (our email inbox), Mapbox (the 3D trail view) and Google (Google sign-in and Compass.AI, see section 5). They handle your data only to provide their service to us.\n\nWe don't sell your data or share it for advertising. We'd disclose it to authorities only where the law requires.`,
  },
  {
    title: "4. Fitness and health answers (Adventure Matchmaker)",
    content: `The Adventure Matchmaker asks about your fitness and, optionally, a few health questions: heart or breathing conditions, joint or bone conditions and recent injuries, ongoing medical needs, medication side effects, smoking and alcohol. Your fitness answers set your eight capability scores. If you answer the health questions, they lower specific scores by fixed amounts (for example, a heart or breathing condition lowers Stamina and Power), never by more than half in total, and they add safety notes on the adventure pages where they matter. Skipping them leaves your scores as your fitness answers set them.\n\nYour health answers are stored separately from your profile, are never shown to anyone else, are never sent to Compass.AI or any other AI service, and are never sold. Your capability scores are visible to the members of any Group Match you join, so a lowered score could hint that a health answer affected it, but the answers themselves are never shared. You can delete your capability and health data at any time in Settings.`,
  },
  {
    title: "5. Compass.AI",
    content: `Compass.AI's answers are written by Google's Gemini models. When you use it, the messages in your conversation and, if you've taken the Adventure Matchmaker, your eight capability levels (not your health answers) are sent to Google so it can suggest adventures that fit you. We don't send your name or email address with them. Google processes them under its own terms and privacy policy. Please don't type personal details into the chat that you wouldn't want processed this way.`,
  },
  {
    title: "6. Maps, photos and weather",
    content: `Maps load straight from the services that draw them: OpenFreeMap for the map, Esri for satellite imagery, the public Terrain Tiles dataset on Amazon Web Services for heights and 3D terrain, and Open-Meteo for weather forecasts. The 3D "Fly the trail" view draws its map with Mapbox, which also collects anonymous usage data about how its maps load. Searching for a place on the map uses OpenStreetMap's Nominatim. Like any website you visit, these services receive your IP address and the area or place being looked up.\n\n"Near me" asks your browser for your location only when you tap it. It's used in your browser to find adventures nearby and isn't sent to us or stored.`,
  },
  {
    title: "7. Cookies and browser storage",
    content: `We use cookies only to keep you signed in. Your browser also stores a few preferences on your device, such as light or dark theme, your chosen map style and your comparison list. We don't use advertising or cross-site tracking cookies, and our analytics doesn't use cookies. Clearing your browser's site data signs you out and resets these preferences.`,
  },
  {
    title: "8. Where it's stored, and for how long",
    content: `Your data is stored by Supabase and our hosting providers, whose servers may be outside India. It's protected by access controls on every table, encrypted connections and hashed passwords, though no online service can promise perfect security.\n\nWe keep your account data while your account is open. When you delete your account, your profile, saved items and uploaded files are removed within 30 days, except where the law requires us to keep something. Quote requests and contact messages are kept for as long as we need them to follow up and for our records, and you can ask us to delete them.`,
  },
  {
    title: "9. Your rights",
    content: `You can ask to see the personal data we hold about you, correct it, delete it, or withdraw consent you've given (for example for alerts or a public passport), including under India's Digital Personal Data Protection Act, 2023. Much of this you can do yourself in your profile and Settings; for anything else, email ${LEGAL_CONTACT}. We'll reply within 30 days. If you're not satisfied with how we've handled a request, you can complain to the Data Protection Board of India.`,
  },
  {
    title: "10. Children",
    content: `The Platform isn't meant for children. If you're under 18, use it only with a parent's or guardian's permission. If you believe a child has given us personal data without that permission, contact us and we'll delete it.`,
  },
  {
    title: "11. Changes and contact",
    content: `We'll update this policy when the Platform's handling of data changes. The date at the top shows the latest version, and we'll email account holders about significant changes. For privacy questions or complaints, email ${LEGAL_CONTACT} (put "Grievance" in the subject for a complaint) or write to Trail to Tides, Mumbai, India.`,
  },
];
