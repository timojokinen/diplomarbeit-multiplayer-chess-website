const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["ks-engine", "ks-game-server"],
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // TODO: Documentation:
    // https://github.com/vercel/next.js/issues/44273
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    if (!isServer) {
      config.resolve.fallback = { fs: false, perf_hooks: false };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
});
