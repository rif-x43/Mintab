let id = null

self.onmessage = (e) => {
  if (e.data === 'start') {
    if (id === null) id = setInterval(() => self.postMessage('tick'), 250)
  } else if (e.data === 'stop') {
    clearInterval(id)
    id = null
  }
}