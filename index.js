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

/**
 * SafeTrek OAuth account authorization URL
 * Production: https://account.safetrek.io
 * Sandbox: https://account-sandbox.safetrek.io
 */
const AUTH_URL = 'https://account-sandbox.safetrek.io'

/**
 * SafeTrek OAuth token URL
 * Production: https://login.safetrek.io/oauth/token
 * Sandbox: https://login-sandbox.safetrek.io/oauth/token
 */
const TOKEN_URL = 'https://login-sandbox.safetrek.io/oauth/token'

/**
 * SafeTrek API base URL
 * Production: https://api.safetrek.io
 * Sandbox: https://api-sandbox.safetrek.io
 */
const API_URL = 'https://api-sandbox.safetrek.io'

// Default scope. DO NOT ALTER.
const SCOPE = 'openid phone offline_access'

// Default response type. DO NOT ALTER.
const RESPONSE_TYPE = 'code'

// Enter your SafeTrek client id.
const CLIENT_ID = 'joZXQTA1wbsq5dX12sI9JfF1CXW7h3AK'

// Enter your client secret.
const CLIENT_SECRET = '6dBPaJ7QqYdwmG83QRVeEf2guUJV7Ys_dGNwYOR0AKSMSe_fpzA28sQb-FMPSg8M'

// Enter where you want to redirect after retrieving your 'access_token' and 'refresh_token'.
// For debugging, you can set this to be a RequestBin URL from https://requestb.in
const REDIRECT_URL = ''

// OAuth demo URL. Will be used as REDIRECT_URL if none is provided.
const DEMO_URL = '/demo'


// Middleware to filter all but GET method requests
app.use((req, res, next) => {
  if(req.method !== 'GET') {
    res.status(405).send('Method not Allowed. Only GET requests are acceptable.')
  } else {
    next()
  }
})

// Heroku proxies requests to add SSL layer.
// Enabling this ensures reporting of proper protocol.
app.enable('trust proxy')

// Enabling Pug templating
app.set('views', './views')
app.set('view engine', 'pug')

// Middleware to parse JSON data in requests
app.use(express.json())

app.get('/demo', function (req, res) {
  let appUrl = `${req.protocol}://${req.get('host')}`
  let client_id = CLIENT_ID || env.CLIENT_ID || ''
  let client_secret = CLIENT_SECRET || env.CLIENT_SECRET || ''
  res.render('index', {
    auth_url: `${AUTH_URL}/authorize?audience=${API_URL}&client_id=${client_id}&scope=${SCOPE}&response_type=${RESPONSE_TYPE}&redirect_uri=${appUrl}`
  })
})

app.get('/', function (req, res) {
  if(req.query.code) {
    let appUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    let redirectUrl = REDIRECT_URL || env.REDIRECT_URL || DEMO_URL
    unirest.post(TOKEN_URL)
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send({
        "grant_type": "authorization_code",
        "code": req.query.code,
        "client_id": CLIENT_ID || env.CLIENT_ID || "",
        "client_secret": CLIENT_SECRET || env.CLIENT_SECRET || "",
        "redirect_uri": appUrl
      })
      .end((response) => {
        log(response.body)
        if(response.body.access_token && response.body.refresh_token && redirectUrl) {
          res.redirect(`${redirectUrl}?authorization_code=${req.query.code}&access_token=${response.body.access_token}&refresh_token=${response.body.refresh_token}`)
        } else {
          res.status(500).send('Internal Server Error. Something went wrong. Please try again')
        }
      })
  } else if(req.query.refresh_token) {
    unirest.post(TOKEN_URL)
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send({
        "grant_type": "refresh_token",
        "refresh_token": req.query.refresh_token,
        "client_id": CLIENT_ID || env.CLIENT_ID || "",
        "client_secret": CLIENT_SECRET || env.CLIENT_SECRET || ""
      })
      .end((response) => {
        if(response.body.access_token && response.body.expires_in) {
          res.json({
            access_token: response.body.access_token,
            expires_in: response.body.expires_in
          })
        } else {
          res.status(500).send('Internal Server Error. Something went wrong. Please try again')
        }
      })
  } else {
    res.status(422).send('Unprocessable Entity. A required parameter is missing.')
  }
})

// Fallback to public for loading assets
app.use(express.static('./public/'))

app.listen(port, () => { log(`Listening on port ${port}`) })