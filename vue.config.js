module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://18.188.233.81:7000',
        secure: false
      }
    }
  }
};