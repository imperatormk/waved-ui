const gotoUrl = (url, newTab) => {
  const param = newTab ? '_blank' : ''
  const win = window.open(url, param)
  win.focus()
}

// eslint-disable-next-line
export { gotoUrl }