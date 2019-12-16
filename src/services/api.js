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

const promisedXhr = (url, { method, body, id }, onProgress) => {
  const promise = (resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('error', () => {
      const resp = JSON.parse(xhr.responseText)
      reject(resp)
    }, false)

    xhr.onreadystatechange = (e) => {
      const { readyState, status } = e.currentTarget
      if (readyState === 4) {
        const resp = JSON.parse(xhr.responseText)
        if (status >= 200 && status < 400) {
          resolve(resp)
          return
        }
        reject(resp)
      }
    }
    if (onProgress) {
      const onProgressInternal = (e) => {
        const percentComplete = e.lengthComputable ? e.loaded / e.total * 100 : 0
        onProgress({ progress: Number(percentComplete.toFixed(1)), track: id })
      }
      xhr.upload.addEventListener('progress', onProgressInternal, false)
    }
    xhr.open(method, url, true)
    xhr.send(body)
  }
  return new Promise(promise)
}

const forgeTrackPromises = (songId, tracks, onProgress) => {
  if (!tracks) return []
  return tracks.map((track) => {
    const formData = new FormData()
    const { file, metadata } = track

    formData.append('track', file)
    formData.append('metadata', JSON.stringify(metadata))

    return promisedXhr(`/api/songs/${songId}/tracks`, {
      method: 'POST',
      body: formData,
      id: metadata.id
    }, onProgress)
  })
}

export default {
  getGenres() {
    return http.get('/genres')
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  getSongs(pageData = {}, criteria = {}) {
    return http.get('/songs', { params: { ...pageData, ...criteria } })
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  getSong(songId, pitch) {
    return http.get(`/songs/${songId}`, { params: { pitch } })
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  getSongBySlug(slug, pitch) {
    return http.get(`/songs/${slug}`, { params: { pitch, idFld: 'slug' } })
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  getProcessings(params) {
    return getAuthHeaders({ params })
      .then(options => http.get('/processings', options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  getProcessing(pcsId, fetchOrderStatus) {
    const params = {}
    if (fetchOrderStatus) params.order_status = true

    return getAuthHeaders({ params })
      .then(options => http.get(`/processings/${pcsId}`, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  processTracks(songId, trackData) {
    return getAuthHeaders()
      .then(options => http.post(`/songs/${songId}/prepare`, trackData, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  postGenre(genre) {
    return getAuthHeaders()
      .then(options => http.post('/genres', genre, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  updateGenre(genre) {
    return getAuthHeaders()
      .then(options => http.put('/genres', genre, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  deleteGenre(genreId) {
    return getAuthHeaders()
      .then(options => http.delete(`/genres/${genreId}`, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  postSong(obj, onProgress) {
    const { thumbnail, song, tracks } = obj

    return getAuthHeaders()
      .then(options => http.post('/songs', song, options))
      .then(resp => resp.data)
      .then((songResult) => {
        const songId = songResult.id

        const trackPromises = forgeTrackPromises(songId, tracks, onProgress)

        const thumbnailPromise = (() => {
          const formData = new FormData()
          formData.append('thumbnail', thumbnail)

          return promisedXhr(`/api/songs/${songId}/thumbnail`, {
            method: 'POST',
            body: formData
          })
        })()

        return Promise.all([...trackPromises, thumbnailPromise])
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
  updateSong(obj, onProgress = () => {}) {
    const {
      thumbnail, song, tracks
    } = obj
    const { id } = song
    delete song.thumbnail

    if (!song.id) {
      const err = { msg: 'invalidSong' }
      return Promise.reject(err)
    }

    return getAuthHeaders()
      .then(options => http.put('/songs', song, options))
      .then(resp => resp.data)
      .then((songResult) => {
        const promises = []

        if (thumbnail) {
          const thumbnailPromise = (() => {
            const formData = new FormData()
            formData.append('thumbnail', thumbnail)

            return promisedXhr(`/api/songs/${id}/thumbnail`, {
              method: 'POST',
              body: formData
            })
          })()
          promises.push(thumbnailPromise)
        }

        if (tracks && tracks.length) {
          const trackPromises = forgeTrackPromises(id, tracks, onProgress)
          promises.push(...trackPromises)
        }

        return Promise.all(promises)
          .then(() => ({
            song: songResult
          }))
      })
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  publishSong(songId) {
    const song = {
      id: songId,
      published: true
    }

    return getAuthHeaders()
      .then(options => http.put('/songs', song, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  deleteSong(songId) {
    return getAuthHeaders()
      .then(options => http.delete(`/songs/${songId}`, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  deleteTracks(tracks, songId) {
    return getAuthHeaders()
      .then((options) => {
        if (!tracks.length) return Promise.resolve([])
        return tracks.map((track) => {
          const { id } = track
          return http.delete(`/songs/${songId}/tracks/${id}`, options)
            .then(resp => resp.data)
        })
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
  updateUser(userObj) {
    return getAuthHeaders()
      .then(options => http.post('/accounts/update', userObj, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  downloadProcessing(pcsId, filename) {
    return getAuthHeaders({ responseType: 'blob' })
      .then(options => http.get(`/processings/${pcsId}/download`, options))
      .then((resp) => {
        const fileNameHeader = 'x-suggested-filename'
        const suggestedFileName = resp.headers[fileNameHeader] || filename
        saveAs(resp.data, suggestedFileName)
      })
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  orderItem(pcsId) {
    return getAuthHeaders()
      .then(options => http.get(`/processings/${pcsId}/order`, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  loadConfig() {
    return http.get('/config')
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  },
  updateLogo(logo) {
    const logoPromise = (() => {
      const formData = new FormData()
      formData.append('logo', logo)

      return promisedXhr('/api/config/logo', {
        method: 'POST',
        body: formData
      })
    })()

    return Promise.all([logoPromise])
  },
  updateConfig(config) {
    return Promise.resolve(config)
  }
}