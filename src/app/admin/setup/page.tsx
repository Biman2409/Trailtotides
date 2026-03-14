"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Database, Loader2, ArrowRight, Copy, Check } from "lucide-react";

const SQL = `CREATE TABLE IF NOT EXISTS public.story_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  author_name text NOT NULL,
  author_role text,
  author_bio text,
  email text,
  phone text,
  date_of_adventure text,
  region text NOT NULL,
  hero_image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.story_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can submit a story"
  ON public.story_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can read all submissions"
  ON public.story_submissions FOR SELECT USING (true);`;

export default function SetupPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function runMigration() {
    if (!password.trim()) {
      setStatus("error");
      setMessage("Please enter your Supabase database password.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/setup-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Migration completed successfully.");
      } else {
        setStatus("error");
        setMessage(data.error || "Migration failed.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Check the console.");
    }
  }

  function copySQL() {
    navigator.clipboard.writeText(SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-start justify-center pt-20 px-6">
      <div className="max-w-xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Database Setup</h1>
            <p className="text-white/40 text-sm">Create the story_submissions table</p>
          </div>
        </div>

        {/* Option A: Automated */}
        <div
          className="rounded-2xl border p-6 mb-4"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-white font-semibold mb-1">Option A — Automated</p>
          <p className="text-white/40 text-sm mb-5 leading-relaxed">
            Enter your Supabase database password. Find it in{" "}
            <a
              href="https://supabase.com/dashboard/project/vmpvmjzursbjwkrgulyp/settings/database"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Project Settings → Database → Database password
            </a>
            .
          </p>

          <input
            type="password"
            placeholder="Database password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runMigration()}
            className="w-full px-4 py-3 rounded-xl text-white text-sm mb-4 outline-none focus:ring-2 focus:ring-amber-500/40"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />

          {status === "error" && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <button
            onClick={runMigration}
            disabled={status === "loading" || status === "success"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: status === "success" ? "#10b981" : "#f59e0b" }}
          >
            {status === "loading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running migration…</>
            ) : status === "success" ? (
              <><CheckCircle2 className="w-4 h-4" /> Done</>
            ) : (
              <>Run Migration <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* Option B: Manual */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold">Option B — Manual</p>
            <button
              onClick={copySQL}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy SQL"}
            </button>
          </div>
          <p className="text-white/35 text-xs mb-4">
            Paste into the{" "}
            <a
              href="https://supabase.com/dashboard/project/vmpvmjzursbjwkrgulyp/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Supabase SQL Editor
            </a>{" "}
            and click Run.
          </p>
          <pre
            className="text-[11px] text-white/50 leading-relaxed overflow-x-auto rounded-xl p-4"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {SQL}
          </pre>
        </div>
      </div>
    </div>
  );
}
