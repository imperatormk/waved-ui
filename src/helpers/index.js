const openInNewTab = (url) => {
  const win = window.open(url, '_blank')
  win.focus()
}

// eslint-disable-next-line
export { openInNewTab }