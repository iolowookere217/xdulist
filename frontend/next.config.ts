import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Treat this folder as the Turbopack workspace root to avoid
    // inferring the monorepo root when multiple lockfiles exist.
    // Use absolute path on Windows to satisfy Turbopack's requirement
    root: "E:/Users/user/Desktop/1.coding/ALX/moneymata/frontend",
  },
};

export default nextConfig;
