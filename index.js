const express = require('express')
const unirest = require('unirest')

const app = express()
const env = process.env
const log = console.log
const port = env.PORT || 5000

/**
 * CONFIGURATION
 * Values provided at the time of Heroku deployment will be used by default.
 */

// SafeTrek OAuth token URL (Default: https://login-sandbox.safetrek.io/oauth/token).
const TOKEN_URL = 'https://login-sandbox.safetrek.io/oauth/token'

// Enter your SafeTrek client id.
const CLIENT_ID = ''

// Enter your client secret.
const CLIENT_SECRET = ''

// Enter where you want to redirect after retrieving your 'access_token' and 'refresh_token'.
// For debugging, you can set this to be a RequestBin URL from https://requestb.in
const REDIRECT_URL = '' || env.REDIRECT_URL

// OAuth demo URL. Will be used as REDIRECT_URL if none is provided.
const DEMO_URL = ''


// Middleware to filter all but GET method requests
app.use((req, res, next) => {
  if(req.method !== 'GET') {
    res.status(400).send('Bad Request. Only GET requests are acceptable.')
  } else {
    next()
  }
})

app.use(express.json())

app.get('/', function (req, res) {
  let appUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  let redirectUrl = REDIRECT_URL || DEMO_URL
  unirest.post(TOKEN_URL)
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .send({
      'grant_type': 'authorization_code',
      'code': req.query.code,
      'client_id': CLIENT_ID || env.CLIENT_ID,
      'client_secret': CLIENT_SECRET || env.CLIENT_SECRET,
      'redirect_uri': appUrl
    })
    .end((response) => {
      if(response.body.access_token && response.body.refresh_token) {
        res.redirect(`${redirectUrl}?access_token=${response.body.access_token}&refresh_token=${response.body.refresh_token}`)
      }
    })
})

app.listen(port, () => { log(`Listening on port ${port}`) })