const express = require('express')
const path = require('path')
const gst = require('google-search-trends')
const googleTrends = require('google-trends-api')
const Twitter = require('twitter')
const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3')
require('dotenv').config()

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const toneAnalyzer = new ToneAnalyzerV3({
  url: process.env.WATSON_URL,
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  version_date: process.env.WATSON_VER_DATE
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
    }),
    client.get('search/tweets', {
      q: keyword,
      lang: 'en',
      result_type: 'popular',
      count: 25
    })
  ])
    .then(res => {
      const datasets = []
      const [time, region, twitter] = res
      const trends = [JSON.parse(time), JSON.parse(region)]
      datasets.push(filterRawTrends(trends))
      datasets.push(filterRawTwitter(twitter))
      return datasets
    })
    .then(datasets => {
      const [trends, twitter] = datasets
      console.log(trends)
      let toneContent = ''
      twitter.forEach(tweet => {
        const text = cleanTweetText(tweet.text)
        toneContent += text + '\n\n'
      })
      toneAnalyzer.tone({
        text: JSON.stringify(toneContent),
        tones: 'emotion'
      },
      (error, analysis) => {
        if (error) {
          console.error(error)
          res.sendStatus(500)
          process.exit(1)
        }
        console.log(analysis)
      })
      return datasets
    })
    .then(filtered => res.json(filtered))
    .catch(reject => console.error(reject))
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

function filterRawTwitter(rawData) {
  const filteredData = []
  const statuses = rawData.statuses
  statuses.forEach(status => {
    const splitText = status.text.split('https://')
    const filtered = {
      createDate: status.created_at,
      tweetURL: 'https://' + splitText[1],
      favoriteCount: status.favorite_count,
      retweetCount: status.retweet_count,
      text: splitText[0].replace('&amp;', '&'),
      username: status.user.name,
      screenName: status.user.screen_name,
      userURL: status.user.url,
      userProfileImg: status.user.profile_image_url,
      verified: status.user.verified
    }
    filteredData.push(filtered)
  })
  return filteredData
}

function cleanTweetText(string) {
  const clean = new RegExp(/(\.|\?|!)$/)
  const unclean = new RegExp(/(\s|…|:)$/)
  if (unclean.test(string)) {
    const replaced = string.replace(unclean, '')
    return cleanTweetText(replaced)
  }
  if (!clean.test(string)) {
    return string + '.'
  }
  return string
}
