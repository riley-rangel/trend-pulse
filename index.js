const express = require('express')
const path = require('path')
const gst = require('google-search-trends')
const googleTrends = require('google-trends-api')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/trending', (req, res) => {
  gst.result((error, response) => {
    if (error) {
      console.error(error)
      res.sendStatus(500)
      process.exit(1)
    }
    res.json(response['1'])
  })
})

app.get('/trending/:keyword', (req, res) => {
  const keyword = req.params.keyword
  const payload = []

  googleTrends.interestOverTime({
    keyword: keyword,
    startTime: new Date(Date.now() - (24 * 60 * 60 * 1000))
  })
    .then(response => JSON.parse(response))
    .then(parsed => parsed.default)
    .then(data => {
      payload.push(data)
    })
    .catch(reject => {
      console.error(reject)
      res.sendStatus(500)
      process.exit(1)
    })

  googleTrends.interestByRegion({
    keyword: keyword,
    startTime: new Date(Date.now() - (24 * 60 * 60 * 1000))
  })
    .then(response => JSON.parse(response))
    .then(parsed => parsed.default)
    .then(data => {
      payload.push(data)
      return payload
    })
    .then(payload => res.json(payload))
    .catch(reject => {
      console.error(reject)
      res.sendStatus(500)
    })
})

app.listen(3000, () => console.log('Port 3000 Open.'))
