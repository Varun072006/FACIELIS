import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  outputFileTracingRoot: path.resolve(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.BACKEND_URL || "http://localhost:5000/api/:path*",
      },
      {
        source: "/images/:path*",
        destination: "http://localhost:5000/images/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:5000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
