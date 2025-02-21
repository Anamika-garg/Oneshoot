/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Primary admin route
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
      // Handle all static file requests
      {
        source: "/static/:path*",
        destination: "/admin/static/:path*",
      },
      // Handle vendor files
      {
        source: "/vendor/:path*",
        destination: "/admin/vendor/:path*",
      },
      // Handle all other admin routes
      {
        source: "/admin/:path*",
        destination: "/admin/:path*",
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*"
          }
        ],
      }
    ];
  },
  // Preserve your existing configurations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ugnqtphzgygdfzenwzfu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  transpilePackages: ["@sanity"]
};

export default nextConfig;