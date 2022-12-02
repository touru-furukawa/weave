module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.unified = false;
      config.resolve.fallback['remark-directive'] = false;
    }
    return config;
  }
};
