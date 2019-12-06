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

        const trackPromises = tracks.map((track) => {
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
  updateSong(obj) {
    const { thumbnail, song } = obj
    delete song.thumbnail

    return getAuthHeaders()
      .then(options => http.put('/songs', song, options))
      .then(resp => resp.data)
      .then((songResult) => {
        if (!thumbnail) return { song: songResult }

        const songId = songResult.id
        const thumbnailPromise = (() => {
          const formData = new FormData()
          formData.append('thumbnail', thumbnail)

          return promisedXhr(`/api/songs/${songId}/thumbnail`, {
            method: 'POST',
            body: formData
          })
        })()

        return Promise.all([thumbnailPromise])
          .then(() => ({
            song: songResult
          }))
      })
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
  orderItem(pcsId) {
    return getAuthHeaders()
      .then(options => http.get(`/processings/${pcsId}/order`, options))
      .then(resp => resp.data)
      .catch((err) => {
        const { data } = err.response
        return Promise.reject(data)
      })
  }
}