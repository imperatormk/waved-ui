import http from './http'

export default {
  processTracks(id, data) {
    return http.post(`/audio/${id}`, data)
  },
}