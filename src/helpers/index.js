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

// eslint-disable-next-line
export {
  gotoUrl, formatDate, capitalizeLetter
}