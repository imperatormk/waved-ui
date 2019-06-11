import http from './http'

export default {
  getTracks(songId) {
    return http.get(`/songs/${songId}`)
      .then(resp => resp.data)
  },
  processTracks(id, data) {
    return http.post(`/audio/${id}`, data)
      .then(resp => resp.data)
  },
}