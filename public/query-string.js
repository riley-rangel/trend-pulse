/* eslint-disable no-unused-vars */

const queryString = {
  parse: query => {
    const object = {}
    if (query) {
      let string = query.slice(1)
      if (string) {
        const pairs = []
        string.split('&').forEach(pair => pairs.push(pair.split('=')))
        pairs.forEach(set => {
          object[set[0]] = set[1]
        })
      }
    }
    return object
  },
  stringify: params => {
    const sets = []
    for (const key in params) {
      sets.push([key, params[key]])
    }
    const string = sets.map(pair => pair.join('=')).join('&')
    if (string) {
      return '?' + string
    }
    else {
      return string
    }
  }
}
