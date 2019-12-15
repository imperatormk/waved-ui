import http from './http'

const STORAGE_KEY = 'waved_user'

const getStoredObj = () => {
  const storedObj = localStorage.getItem(STORAGE_KEY)
  if (storedObj) return JSON.parse(storedObj)
  return null
}

const persistUser = ({ token, user }, forceReload) => {
  if (!forceReload) {
    const storedAuthObj = getStoredObj()
    const oldUser = { ...storedAuthObj.user }
    storedAuthObj.user = user
    storedAuthObj.user.isAdmin = oldUser.isAdmin
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAuthObj))
  } else {
    const authObj = JSON.stringify({ token, user })
    localStorage.setItem(STORAGE_KEY, authObj)
  }
  return user
}

const login = (username, password) => http.post('/auth/login', { username, password })
  .then(resp => resp.data)
  .then(result => persistUser(result, true))

const logout = () => {
  localStorage.removeItem(STORAGE_KEY)
}

const getJwt = () => {
  const storedObj = getStoredObj()
  return storedObj ? storedObj.token : null
}

const getUser = () => {
  const storedObj = getStoredObj()
  return storedObj ? storedObj.user : null
}

export default {
  login,
  logout,
  getJwt,
  getUser,
  persistUser
}