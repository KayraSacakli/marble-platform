import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";
import { validateEnv } from "./src/lib/env";

// Fail fast at build time and server startup when required production
// environment variables are missing, invalid, or placeholders.
// No-op under `next dev` (development) — see src/lib/env.ts.
validateEnv();

// Production security headers (CSP, clickjacking, sniffing, referrer,
// HSTS, permissions) — single source of truth lives in
// src/lib/security/headers.ts (unit-tested) and is applied to every
// response from this config.
const securityHeaders = Object.entries(getSecurityHeaders()).map(([key, value]) => ({
  key,
  value,
}));

// Media assets are same-origin local files (public/demo/images/*.svg and
// /api/media/*). The optimizer refuses SVG unless explicitly allowed; SVGs
// are then served with a sandboxed CSP instead of executable content.
function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: { protocol: "http" | "https"; hostname: string; port?: string }[] = [
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
  ];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      patterns.push({
        protocol: url.protocol === "https:" ? "https" : "http",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      });
    } catch {
      // Invalid SITE_URL is rejected by validateEnv() in production.
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: imageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
