module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  async redirects() {
    return [
      {
        source: "/articles",
        destination: "/articles/list/all/1",
        permanent: true,
      },
      {
        source: "/forms",
        destination: "/forms/list/all/1",
        permanent: true,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
