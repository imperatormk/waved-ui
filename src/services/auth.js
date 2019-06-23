import http from './http'

const STORAGE_KEY = 'waved_user'

const login = (username, password) => http.post('/auth/login', { username, password })
  .then(resp => resp.data)
  .then((result) => {
    const resultObj = JSON.stringify(result)
    localStorage.setItem(STORAGE_KEY, resultObj)
    return JSON.parse(resultObj).user
  })

const logout = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const getStoredObj = () => {
  const storedObj = localStorage.getItem(STORAGE_KEY)
  if (storedObj) return JSON.parse(storedObj)
  return null
}

const getJwt = () => {
  const storedObj = getStoredObj()
  return storedObj.token || null
}

const getUser = () => {
  const storedObj = getStoredObj()
  return storedObj.user || null
}

export default {
  login,
  logout,
  getJwt,
  getUser
}