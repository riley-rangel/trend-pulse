/* eslint-disable no-unused-vars */
/* global queryString */

class HashRouter {
  constructor($views) {
    this.isListening = false
    this.handlers = {}
    this.$views = Array.from($views)
  }

  when(hash, handler) {
    this.handlers[hash] = handler
  }

  push(hash, params) {
    const hashUpdate = hash + queryString.stringify(params)
    window.location.hash = hashUpdate
  }

  match(hashString) {
    const [hash, ...queries] = hashString.split('?')
    const params = {}
    if (queries) {
      queries.forEach(query => {
        const pairs = query.split('=')
        params[pairs[0]] = pairs[1]
      })
    }
    const handler = this.handlers[hash]
    const $view = this.$views.find($view => $view.id === hash)
    if (handler) {
      handler($view, params)
        .then(response => {
          this.$views.forEach($view => {
            $view.id === hash
              ? $view.classList.remove('hide')
              : $view.classList.add('hide')
          })
        })
    }
  }

  listen() {
    if (this.isListening) return
    window.addEventListener('hashchange', () => {
      const hashString = window.location.hash.slice(1)
      this.match(hashString)
    })
    window.dispatchEvent(new Event('hashchange'))
    this.isListening = true
  }
}
