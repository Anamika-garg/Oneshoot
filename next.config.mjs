/** @type {import('next').NextConfig} */
const nextConfig = {
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
  transpilePackages: ["@sanity"],
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ]
  },
};

export default nextConfig;
