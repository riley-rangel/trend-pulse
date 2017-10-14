/* eslint-disable no-unused-vars */
/* global queryString */

class HashRouter {
  constructor($views) {
    this.isListening = false
    this.handlers = {}
    this.$views = Array.from($views)
  }
}
