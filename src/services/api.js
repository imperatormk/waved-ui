import http from './http'

export default {
  getSongs() {
    return http.get('/songs')
      .then(resp => resp.data)
  },
  getSong(songId, pitch) {
    return http.get(`/songs/${songId}`, { params: { pitch } })
      .then(resp => resp.data)
  },
  processTracks(id, data) {
    return http.post(`/audio/${id}`, data)
      .then(resp => resp.data)
  },
  postSong(obj) {
    const { song, tracks } = obj

    return http.post('/songs', song)
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
          .then((trackResults) => {
            return {
              song: songResult,
              tracks: trackResults
            }
          })
      })
  },
}