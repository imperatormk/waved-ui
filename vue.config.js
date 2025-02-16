const fallbackServerUrl = 'https://studiodoblo.de:7000'
const serverUrl = process.env.VUE_APP_SERVER_URL || fallbackServerUrl

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
