// Upload byte checks and Compass.AI request routing, on the real code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sniffImage, bytesMatchType } from "../src/lib/imageSniff";

const bytes = (...b: number[]) => new Uint8Array([...b, ...Array(16).fill(0)]);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const WEBP = new Uint8Array([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)), Array(8).fill(0)));
const HTML = new TextEncoder().encode("<html><script>alert(1)</script></html>");
const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

test("real images are recognised by their bytes", () => {
  assert.equal(sniffImage(JPEG), "image/jpeg");
  assert.equal(sniffImage(PNG), "image/png");
  assert.equal(sniffImage(WEBP), "image/webp");
});

test("HTML, SVG and empty files are not images, whatever type they claim", () => {
  for (const b of [HTML, SVG, new Uint8Array()]) {
    assert.equal(sniffImage(b), null);
    assert.equal(bytesMatchType(b, "image/png"), false);
  }
});

test("a file must be the type it claims ('image/jpg' counts as JPEG)", () => {
  assert.equal(bytesMatchType(JPEG, "image/jpeg"), true);
  assert.equal(bytesMatchType(JPEG, "image/jpg"), true);
  assert.equal(bytesMatchType(PNG, "image/jpeg"), false);
  assert.equal(bytesMatchType(WEBP, "image/webp"), true);
});

// Operator sign-up: every field is checked before an account is made or an email is sent
import { operatorSignupSchema } from "../src/lib/operatorSignup";
import { readFileSync } from "node:fs";

const SB = "https://abc.supabase.co";
const good = {
  contact_name: "Asha Rawat", company_name: "Summit Adventures", email: " Asha@Example.com ",
  country_code: "+91", phone: "98765 43210", website: "https://summitadventures.com",
  logo_url: `${SB}/storage/v1/object/public/operator-profiles/abc-logo.png`, password: "longenough",
};

test("a valid operator sign-up passes and is normalised", () => {
  const r = operatorSignupSchema(SB).safeParse(good);
  assert.ok(r.success);
  assert.equal(r.data.email, "asha@example.com");
  assert.equal(r.data.phone, "9876543210");
  assert.ok(operatorSignupSchema(SB).safeParse({ ...good, website: "", logo_url: "" }).success);
});

test("operator sign-up refuses bad input and logos hosted elsewhere", () => {
  const bad: Partial<typeof good>[] = [
    { email: "not-an-email" }, { phone: "12" }, { phone: "98765abc10" }, { country_code: "91" },
    { website: "javascript:alert(1)" }, { website: "summit" }, { contact_name: "x".repeat(81) },
    { company_name: "" }, { password: "short" },
    { logo_url: "https://evil.example/logo.png" },
    { logo_url: `${SB}/storage/v1/object/public/avatars/x.png` },
  ];
  for (const b of bad) assert.equal(operatorSignupSchema(SB).safeParse({ ...good, ...b }).success, false, JSON.stringify(b));
});

test("the security migration locks profile roles and story publishing", () => {
  const sql = readFileSync("supabase/migrations/20261122000000_lock_profile_roles_and_story_moderation.sql", "utf8");
  assert.match(sql, /REVOKE INSERT, UPDATE ON public\.profiles FROM anon, authenticated/);
  const grant = sql.match(/GRANT UPDATE \(([^)]*)\) ON public\.profiles TO authenticated/);
  assert.ok(grant, "column grant present");
  assert.doesNotMatch(grant![1], /\brole\b|public_id|\bid\b/);
  assert.match(sql, /BEFORE UPDATE ON public\.profiles/);
  assert.match(sql, /DROP POLICY IF EXISTS "Auth users can insert stories"/);
  assert.match(sql, /DROP POLICY IF EXISTS "Authors can update own stories"/);
  assert.match(sql, /status SET DEFAULT 'pending'/);
  for (const f of ["supabase/setup.sql", "supabase/setup_only.sql"]) {
    const s = readFileSync(f, "utf8");
    assert.doesNotMatch(s, /CREATE POLICY "Users update own profile" ON public\.profiles FOR UPDATE USING \(auth\.uid\(\) = id\);/, f);
    assert.doesNotMatch(s, /Authors can update own stories" ON/, f);
  }
});

test("the health-answers migration keeps the table private and allows the operator role", () => {
  const sql = readFileSync("supabase/migrations/20261122010000_private_ace_medical_and_operator_role.sql", "utf8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.ace_medical/);
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL ON public\.ace_medical FROM anon, authenticated/);
  assert.doesNotMatch(sql, /CREATE POLICY/);
  assert.match(sql, /CHECK \(role IN \('user', 'admin', 'operator'\)\)/);
});
