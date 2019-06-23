import auth from '../services/auth'

const user = auth.getUser()
const initialState = user
  ? { status: { loggedIn: true }, user }
  : { status: {}, user: null }

export default {
  namespaced: true,
  state: initialState,
  actions: {
    login({ commit }, { username, password }) {
      commit('loginRequest', { username })

      return auth.login(username, password)
        .then((userObj) => {
          commit('loginSuccess', userObj)
          return userObj
        })
        .catch((err) => {
          commit('loginFailure')
          const { data } = err.response
          return Promise.reject(data)
        })
    },
    logout({ commit }) {
      auth.logout()
      commit('logout')
    }
  },
  mutations: {
    loginRequest(state, userObj) {
      state.status = { loggingIn: true }
      state.user = userObj
    },
    loginSuccess(state, userObj) {
      state.status = { loggedIn: true }
      state.user = userObj
    },
    loginFailure(state) {
      state.status = {}
      state.user = null
    },
    logout(state) {
      state.status = {}
      state.user = null
    }
  }
}
