import type { NextConfig } from "next";

const DEFAULT_BACKEND = "https://ftw9rcd4.up.railway.app";

/** Use only a valid https URL — Vercel env vars may accidentally contain pasted log text. */
function resolveBackendUrl(): string {
  const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const trimmed = raw.trim();

  if (trimmed.startsWith("https://") && !trimmed.includes("\n")) {
    return trimmed.replace(/\/$/, "");
  }

  const match = trimmed.match(/https:\/\/[^\s"'<>]+/);
  if (match) {
    return match[0].replace(/\/$/, "");
  }

  return DEFAULT_BACKEND;
}

const backendUrl = resolveBackendUrl();

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 95],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
