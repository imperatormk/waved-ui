import { saveAs } from 'file-saver'
import http from './http'
import auth from './auth'

const getAuthHeaders = (opts) => {
  const options = opts || {}
  return Promise.resolve(auth.getJwt())
    .then(token => ({
      ...options,
      headers: {
        Authorization: `JWT ${token}`
      }
    }))
}

export default {
  getSongs(pageData = {}, criteria = {}) {
    return http.get('/songs', { params: { ...pageData, ...criteria } })
      .then(resp => resp.data)
  },
  getSong(songId, pitch) {
    return http.get(`/songs/${songId}`, { params: { pitch } })
      .then(resp => resp.data)
  },
  getProcessings(params) {
    return getAuthHeaders({ params })
      .then(options => http.get('/processings', options))
      .then(resp => resp.data)
  },
  processTracks(songId, data) {
    return getAuthHeaders()
      .then(options => http.post(`/songs/${songId}/prepare`, data, options))
      .then(resp => resp.data)
  },
  postSong(obj) {
    const { song, tracks } = obj

    return getAuthHeaders()
      .then(options => http.post('/songs', song, options))
      .then(resp => resp.data)
      .then((songResult) => {
        const songId = songResult.id

        const trackPromises = tracks.map((track) => {
          const formData = new FormData()

          formData.append('track', track.file)
          formData.append('metadata', JSON.stringify(track.metadata))

          return fetch(`/api/songs/${songId}/tracks`, {
            method: 'POST',
            body: formData
          })
            .then(resp => resp.json())
        })

        return Promise.all(trackPromises)
          .then(trackResults => ({
            song: songResult,
            tracks: trackResults
          }))
      })
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  registerUser(userObj) {
    return http.post('/accounts/register', userObj)
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  downloadProcessing(pcsId, filename) {
    return getAuthHeaders({ responseType: 'blob' })
      .then(options => http.get(`/processings/${pcsId}/download`, options))
      .then((response) => {
        const fileNameHeader = 'x-suggested-filename'
        const suggestedFileName = response.headers[fileNameHeader] || filename
        saveAs(response.data, suggestedFileName)
      })
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  doit(pcsId) {
    return getAuthHeaders()
      .then(options => http.get(`/processings/${pcsId}/doit`, options))
      .then(resp => resp.data)
  }
}