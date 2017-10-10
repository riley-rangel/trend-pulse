const express = require('express')
const path = require('path')
const gst = require('google-search trends')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.listen(3000, () => console.log('Port 3000 Open.'))
