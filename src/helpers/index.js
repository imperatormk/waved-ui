import moment from 'moment'

const gotoUrl = (url, newTab) => {
  const param = newTab ? '_blank' : ''
  const win = window.open(url, param)
  win.focus()
}

const formatDate = (date, format) => {
  if (!date || !format) return null
  return moment(date).format(format)
}

const capitalizeLetter = (str) => {
  if (!str) return str
  return `${str[0].toUpperCase()}${str.substring(1)}`
}

const getFileMeta = (file) => {
  const readerData = new FileReader()
  const readerBuffer = new FileReader()

  const audioObjHtml = '<audio id="audioObj" src=""></audio>'
  const div = document.createElement('div')
  div.innerHTML = audioObjHtml.trim()
  const audioObj = div.firstChild

  return new Promise((resolve, reject) => {
    try {
      let durationVal = null
      let buffer = null

      readerData.onload = (e) => {
        audioObj.src = e.target.result
        audioObj.addEventListener('loadedmetadata', () => {
          const { duration } = audioObj
          durationVal = duration
          if (buffer) {
            resolve({ duration: durationVal, buffer })
          }
        }, false)
      }
      readerData.readAsDataURL(file)

      readerBuffer.onload = (e) => {
        const blob = new window.Blob([new Uint8Array(e.target.result)])
        buffer = blob
        if (durationVal != null) {
          resolve({ duration: durationVal, buffer })
        }
      }
      readerBuffer.readAsArrayBuffer(file)
    } catch (e) {
      reject(e)
    } finally {
      div.remove()
    }
  })
}

const pad2 = number => (number < 10 ? '0' : '') + number

// eslint-disable-next-line
export {
  gotoUrl, formatDate, capitalizeLetter, getFileMeta, pad2
}