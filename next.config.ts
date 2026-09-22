import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/volunteer",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "web-push"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/volunteer" },
        ],
      },
      {
        source: "/offline.html",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
  async redirects() {
    // Catch post-login Location headers that omit basePath.
    return [
      {
        source: "/",
        destination: "/volunteer",
        permanent: false,
        basePath: false,
      },
      {
        source: "/volunteer-hub-logo.jpg",
        destination: "/volunteer/volunteer-hub-logo.jpg",
        permanent: false,
        basePath: false,
      },
      {
        source: "/admin",
        destination: "/volunteer/admin",
        permanent: false,
        basePath: false,
      },
      {
        source: "/admin/:path*",
        destination: "/volunteer/admin/:path*",
        permanent: false,
        basePath: false,
      },
      {
        source: "/dashboard",
        destination: "/volunteer/dashboard",
        permanent: false,
        basePath: false,
      },
      {
        source: "/login",
        destination: "/volunteer/login",
        permanent: false,
        basePath: false,
      },
      {
        source: "/register",
        destination: "/volunteer/register",
        permanent: false,
        basePath: false,
      },
      {
        source: "/shifts",
        destination: "/volunteer/shifts",
        permanent: false,
        basePath: false,
      },
      {
        source: "/shifts/:path*",
        destination: "/volunteer/shifts/:path*",
        permanent: false,
        basePath: false,
      },
      {
        source: "/profile",
        destination: "/volunteer/profile",
        permanent: false,
        basePath: false,
      },
      {
        source: "/my-shifts",
        destination: "/volunteer/my-shifts",
        permanent: false,
        basePath: false,
      },
      {
        source: "/hours",
        destination: "/volunteer/hours",
        permanent: false,
        basePath: false,
      },
      {
        source: "/documents",
        destination: "/volunteer/documents",
        permanent: false,
        basePath: false,
      },
      {
        source: "/training",
        destination: "/volunteer/training",
        permanent: false,
        basePath: false,
      },
      {
        source: "/install",
        destination: "/volunteer/install",
        permanent: false,
        basePath: false,
      },
      {
        source: "/icons/:path*",
        destination: "/volunteer/icons/:path*",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
