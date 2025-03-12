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
      },
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
            value: "*",
          },
        ],
      },
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
  transpilePackages: ["@sanity"],

  // Remove console logs in production
  webpack: (config, { dev, isServer }) => {
    // Only run in client-side production builds
    if (!dev && !isServer) {
      // Find the terser plugin in the webpack config
      const terserPluginIndex = config.optimization.minimizer.findIndex(
        (minimizer) => minimizer.constructor.name === "TerserPlugin"
      );

      if (terserPluginIndex > -1) {
        // Get the terser plugin instance
        const terserPlugin = config.optimization.minimizer[terserPluginIndex];

        // Update the terser options to drop console statements
        terserPlugin.options.terserOptions = {
          ...terserPlugin.options.terserOptions,
          compress: {
            ...terserPlugin.options.terserOptions?.compress,
            drop_console: true,
          },
        };
      }
    }

    // Handle punycode deprecation warning
    if (dev) {
      // Add fallback for punycode in webpack 5
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false,
      };
    }

    return config;
  },
  // Suppress specific Node.js warnings during development
  onDemandEntries: {
    // These options are for the development server
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

// Suppress the punycode deprecation warning when running the dev server
if (process.env.NODE_ENV !== "production") {
  process.emitWarning = (warning, type, code, ...args) => {
    if (code === "DEP0040") {
      // Suppress the punycode deprecation warning
      return;
    }
    return process.emitWarning(warning, type, code, ...args);
  };
}

export default nextConfig;
