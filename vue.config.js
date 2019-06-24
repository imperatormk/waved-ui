const serverUrl = 'http://localhost:7000'

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