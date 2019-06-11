module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        secure: false
      }
    }
  }
};