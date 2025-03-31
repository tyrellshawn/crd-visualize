/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      path: false,
      os: false,
      crypto: false,
    };
    
    return config;
  },
  // This is important to prevent server-only code from being included in client bundles
  experimental: {
    serverComponentsExternalPackages: ["@kubernetes/client-node"],
  },
};

export default nextConfig;

