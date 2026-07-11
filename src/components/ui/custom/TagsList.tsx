"use client";

interface Props {
  tags: string[];
}

export default function TagsList({ tags }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-3 py-1.5 rounded-full transition-colors hover:brightness-150 cursor-default"
          style={{
            color: "var(--text-tertiary)",
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}