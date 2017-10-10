const express = require('express')
const path = require('path')
const gst = require('google-search-trends')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/trending', (req, res) => {
  gst.result((error, response) => {
    if (error) {
      console.error(error)
      res.sendStatus(404)
      process.exit(1)
    }
    res.json(response['1'])
  })
})

app.listen(3000, () => console.log('Port 3000 Open.'))
