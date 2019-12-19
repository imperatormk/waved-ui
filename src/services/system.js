const getServerUrl = () => {
  const fallbackServerUrl = 'https://studiodoblo.de:7000'
  const serverUrl = process.env.VUE_APP_SERVER_URL || fallbackServerUrl
  return serverUrl
}

// eslint-disable-next-line
export { getServerUrl }