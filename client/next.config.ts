import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `script-src` keeps 'unsafe-inline' because the App Router emits inline scripts
 * for the RSC/hydration payload, and the inline theme script in app/layout.tsx
 * runs before paint to avoid a flash of the wrong theme. Locking that directive
 * down means switching to nonces, which requires middleware and would opt every
 * page out of static prerendering — a bigger change than this warrants.
 *
 * The directives that actually stop the attacks we care about are unaffected by
 * that: `frame-ancestors 'none'` blocks clickjacking of the transaction-signing
 * UI, `object-src 'none'` blocks plugin-based injection, and `base-uri 'self'`
 * blocks <base> tag hijacking of relative URLs.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Soroban RPC + Horizon, testnet and mainnet.
  "connect-src 'self' https://*.stellar.org",
  // Wallet popups (Albedo) and the wallet-kit modal.
  "frame-src 'self' https://albedo.link https://xbull.app",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
