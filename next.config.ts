import type { NextConfig } from "next";

// App Hosting runs Next.js as a Cloud Run service (SSR-capable), so no
// `output: "export"` here — that mode is only for the static-export /
// classic Firebase Hosting path.
const nextConfig: NextConfig = {};

export default nextConfig;
