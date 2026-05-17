"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ClaudeOutput({ text }: { text: string }) {
  return (
    <div className="prose-claude">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

export function ThinkingBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <details className="mb-4" open={false}>
      <summary className="cursor-pointer text-xs uppercase tracking-wider text-[var(--text-dim)] hover:text-[var(--accent-soft)] mb-2 select-none">
        Claude&apos;s extended thinking ({text.length} chars) — click to expand
      </summary>
      <div className="thinking-block">{text}</div>
    </details>
  );
}
