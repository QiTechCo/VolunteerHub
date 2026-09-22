import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/volunteer",
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
};

export default nextConfig;
