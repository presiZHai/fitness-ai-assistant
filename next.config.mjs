// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      // Only modify Webpack configuration for server-side
      if (!isServer) {
        // Provide polyfills or fallbacks for Node.js modules in client-side
        config.resolve.fallback = {
          ...config.resolve.fallback,
          buffer: false, // Disable resolving buffer on the client-side
        };
      }
  
      return config;
    },
  };
  
  export default nextConfig;
  


// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
