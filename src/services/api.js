import http from './http'

export default {
  getSongs() {
    return http.get('/songs')
      .then(resp => resp.data)
  },
  getSong(songId) {
    return http.get(`/songs/${songId}`)
      .then(resp => resp.data)
  },
  processTracks(id, data) {
    return http.post(`/audio/${id}`, data)
      .then(resp => resp.data)
  },
  postSong(obj) {
    const formData = new FormData()

    // obj.tracks.forEach((fileObj, index) => {
    //   const { file } = fileObj
    //   formData.append(`track-${index}`, file)
    // })
    const tracks = obj.tracks.map((fileObj, index) => {
      const { file } = fileObj
      return file
    })
    formData.append('tracks', tracks)

    const data = {
      song: obj.song,
      tracks: obj.tracks.map(track => track.metadata)
    }
    formData.append('data', JSON.stringify(data))

    return fetch('/api/songs', {
      method: 'POST',
      body: formData
    })
  },
}