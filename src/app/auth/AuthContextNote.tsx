import { Users, PenLine, Compass } from "lucide-react";

// Where someone was headed when they were asked to sign in, told back to them in one line, so a
// friend arriving from a group invite knows what this page is for and what happens next.

type Intent = { icon: typeof Users; title: string; body: string };

export function intentFor(next: string | null | undefined): Intent | null {
  if (!next) return null;
  if (next.startsWith("/matchmaker/group")) {
    return {
      icon: Users,
      title: "You're joining a Group Match",
      body: "Sign in or create a free account, take the 2-minute quick match, and you'll land straight in the group.",
    };
  }
  if (next.startsWith("/matchmaker")) {
    return { icon: Compass, title: "Save your fitness match", body: "Sign in to keep your results and see them on every adventure." };
  }
  if (next.startsWith("/stories/submit")) {
    return { icon: PenLine, title: "Share your story", body: "Sign in so your story shows on your profile with your avatar." };
  }
  return null;
}

export default function AuthContextNote({ next }: { next: string | null | undefined }) {
  const intent = intentFor(next);
  if (!intent) return null;
  const Icon = intent.icon;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,81,0,0.08)", border: "1px solid rgba(255,81,0,0.25)" }}>
      <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.15)" }}>
        <Icon className="w-4 h-4 text-[#ff5100]" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-white">{intent.title}</span>
        <span className="block text-xs leading-relaxed text-white/60 mt-0.5">{intent.body}</span>
      </span>
    </div>
  );
}
