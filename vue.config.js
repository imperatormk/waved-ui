const serverUrl = 'https://studiodoblo.de:7000'

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: serverUrl,
        secure: false
      }
    },
    disableHostCheck: true,
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/waved/'
    : '/'
};
