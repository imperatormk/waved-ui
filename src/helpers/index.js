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

// eslint-disable-next-line
export { gotoUrl, formatDate }