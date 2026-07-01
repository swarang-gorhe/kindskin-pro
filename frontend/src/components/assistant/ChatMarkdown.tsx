import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  content: string;
};

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-forest">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const internal = href.startsWith("/");
      const className =
        "font-medium text-forest underline underline-offset-2 decoration-forest/30 hover:decoration-forest";
      return internal ? (
        <Link key={i} href={href} className={className}>
          {label}
        </Link>
      ) : (
        <a key={i} href={href} className={className} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <em key={i} className="text-muted">
          {italicMatch[1]}
        </em>
      );
    }
    return part;
  });
}

export function ChatMarkdown({ content }: Props) {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="chat-prose text-[13.5px] leading-[1.65] text-forest/90 space-y-3">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="text-sm font-semibold text-forest mt-1 mb-1">
              {trimmed.replace(/^### /, "")}
            </h4>
          );
        }

        const lines = trimmed.split("\n");
        const isList = lines.every((l) => l.startsWith("- ") || l.startsWith("* "));

        if (isList) {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {lines.map((line, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-forest/40" />
                  <span>{renderInline(line.replace(/^[-*] /, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
