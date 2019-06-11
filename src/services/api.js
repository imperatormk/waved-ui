import http from './http'

export default {
  getSong(songId) {
    return http.get(`/songs/${songId}`)
      .then(resp => resp.data)
  },
  processTracks(id, data) {
    return http.post(`/audio/${id}`, data)
      .then(resp => resp.data)
  },
}