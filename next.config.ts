import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";

// Production security headers (CSP, clickjacking, sniffing, referrer,
// HSTS, permissions) — single source of truth lives in
// src/lib/security/headers.ts (unit-tested) and is applied to every
// response from this config.
const securityHeaders = Object.entries(getSecurityHeaders()).map(([key, value]) => ({
  key,
  value,
}));

const nextConfig: NextConfig = {
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
