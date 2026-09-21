import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    return String(pkg.version);
  } catch {
    return "0.0.0";
  }
}

function readGitShortHash() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

// Vercel setzt VERCEL_GIT_COMMIT_SHA (dort gibt es evtl. kein .git); lokal fragen wir git.
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || readGitShortHash();

// Nur einmal pro Build festlegen: Kindprozesse erben den Wert und laden die Config nicht mit
// einem abweichenden Zeitstempel neu.
process.env.APP_BUILD_TIME ??= new Date().toISOString();

const noCache = [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }];

const nextConfig: NextConfig = {
  // Werden beim Build in den Code eingesetzt (Server und Client) -> Versions-Stempel + SW-Build-ID.
  env: {
    NEXT_PUBLIC_APP_VERSION: readPackageVersion(),
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
    NEXT_PUBLIC_BUILD_TIME: process.env.APP_BUILD_TIME,
  },
  async headers() {
    return [
      // Diese Dateien dürfen weder Browser noch CDN dauerhaft halten, sonst hängen Updates fest.
      // (Für Seiten selbst setzt Next passende Header; /_next/static ist gehasht und unveränderlich.)
      { source: "/sw.js", headers: noCache },
      { source: "/offline.html", headers: noCache },
      { source: "/manifest.webmanifest", headers: noCache },
    ];
  },
};

export default nextConfig;
