import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep Turbopack inside this repository when other lockfiles exist above it.
    root: path.resolve(process.cwd(), ".."),
  },
};

export default nextConfig;
