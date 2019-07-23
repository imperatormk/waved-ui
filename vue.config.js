const serverUrl = 'http://164.68.104.239:7000'

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: serverUrl,
        secure: false
      }
    }
  }
};