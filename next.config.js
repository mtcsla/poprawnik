module.exports = {
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
