const express = require('express')
const path = require('path')
const gst = require('google-search-trends')
const googleTrends = require('google-trends-api')
const Twitter = require('twitter')
require('dotenv').config()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

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
  Promise.all([
    googleTrends.interestOverTime({
      keyword: keyword,
      startTime: new Date(Date.now() - (24 * 60 * 60 * 1000))
    }),
    googleTrends.interestByRegion({
      keyword: keyword,
      startTime: new Date(Date.now() - (24 * 60 * 60 * 1000))
    })
  ])
    .then(res => {
      const [time, region] = res
      const datasets = [JSON.parse(time), JSON.parse(region)]
      return filterRawTrends(datasets)
    })
    .then(filtered => res.json(filtered))
    .catch(reject => console.error(reject))
})

app.get('/tweets/:keyword', (req, res) => {
  const keyword = req.params.keyword
  client.get('search/tweets', {
    q: keyword,
    lang: 'en',
    result_type: 'popular',
    count: 25
  })
    .then(response => res.json(response))
    .catch(reject => {
      res.sendStatus(500)
      console.error(reject)
    })
})

app.listen(3000, () => console.log('Port 3000 Open.'))

function filterRawTrends(rawData) {
  const timelineData = rawData[0].default.timelineData
  const areaGraphData = []
  timelineData.forEach(dataset => {
    areaGraphData.push({
      'time': dataset.formattedTime,
      'value': dataset.value[0]
    })
  })
  const geoMapData = rawData[1].default.geoMapData
  const worldMapData = []
  geoMapData.forEach(dataset => {
    worldMapData.push({
      'geoName': dataset.geoName,
      'value': dataset.value[0]
    })
  })
  const data = [areaGraphData, worldMapData]
  return data
}
