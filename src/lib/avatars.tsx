export const LS_KEY = "ttt_avatar_id";

export interface AvatarDef {
  id: number;
  label: string;
  src: string;
}

export const AVATARS: AvatarDef[] = [
  // ── Boys ──
  { id: 1,  label: "Wild-Keeper",   src: "/avatars/avatar-1.png"  },
  { id: 4,  label: "Wind-Dancer",   src: "/avatars/avatar-4.png"  },
  { id: 5,  label: "Dust-Racer",    src: "/avatars/avatar-5.png"  },
  { id: 6,  label: "Tide-Seeker",   src: "/avatars/avatar-6.png"  },
  { id: 10, label: "Peak-Finder",   src: "/avatars/avatar-10.png" },
  // ── Girls ──
  { id: 2,  label: "Ice-Breaker",   src: "/avatars/avatar-2.png"  },
  { id: 3,  label: "Crag-Master",   src: "/avatars/avatar-3.png"  },
  { id: 7,  label: "Star-Charter",  src: "/avatars/avatar-7.png"  },
  { id: 8,  label: "Spoke-Breaker", src: "/avatars/avatar-8.png"  },
  { id: 9,  label: "Rapid-Rider",   src: "/avatars/avatar-9.png"  },
];
