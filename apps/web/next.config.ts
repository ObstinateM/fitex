import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { resolve } from "path";

// Load .env from monorepo root so NEXT_PUBLIC_* vars are available
loadEnvConfig(resolve(__dirname, "../.."));

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
