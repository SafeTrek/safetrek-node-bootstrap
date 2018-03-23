const express = require('express')
const unirest = require('unirest')
const dotenv = require('dotenv')

const app = express()
const env = process.env
const log = console.log
// Set your port number for localhost
// Could be 3000, 5000, 8000 or 8080. Other ports are not whitelisted.
const port = env.PORT || 5000

/** 
 * Load environment variables from .env file
 * when running in a non-production environment.
 * When running on localhost, create a ".env" file in the
 * root directory, and provide the following:-
 * CLIENT_ID=<value>
 * CLIENT_SECRET=<value>
 */ 
if (env.NODE_ENV !== 'production') dotenv.config()

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
 * Default Callback path (with leading slash)
 * This path is whitelisted on all herokuapp.com sub-domains.
 * To get your custom domain or paths whitelisted, please contact us.
 */

const CALLBACK_PATH = '/callback'

// Default scope. DO NOT ALTER.
const SCOPE = 'openid phone offline_access'

// Default response type. DO NOT ALTER.
const RESPONSE_TYPE = 'code'

/**
 * Your SafeTrek Client ID (read from the environment)
 * Set it in a ".env" file in the root directory if running on localhost
 * DO NOT enter it below! You might accidentally commit and make it public.
 */
const CLIENT_ID = env.CLIENT_ID || ''

/**
 * Your SafeTrek Client Secret (read from the environment)
 * Set it in a ".env" file in the root directory if running on localhost
 * DO NOT enter it below! You might accidentally commit and make it public.
 */
const CLIENT_SECRET = env.CLIENT_SECRET || ''

// Enter where you want to redirect after retrieving your 'access_token' and 'refresh_token'.
// Should have a trailing slash. Read from environment if not set below.
// For debugging, you can set this to be a RequestBin URL from https://requestb.in
const REDIRECT_URL = ''

// OAuth demo URL. Will be used as REDIRECT_URL if none is provided.
const DEMO_URL = '/'


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
app.set('views', 'views')
app.set('view engine', 'pug')

// Middleware to parse JSON data in requests
app.use(express.json())

app.get(DEMO_URL, function (req, res) {
  let appUrl = `${req.protocol}://${req.get('host')}${CALLBACK_PATH}`
  let localhost = req.hostname === 'localhost' ? 'true' : 'false'
  res.render('index', {
    company_name: 'SafeTrek',
    auth_url: `${AUTH_URL}/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}&response_type=${RESPONSE_TYPE}&redirect_uri=`,
    redirect_uri: appUrl,
    protocol: req.protocol,
    callback: CALLBACK_PATH,
    localhost: localhost,
    port: port
  })
})

app.get(CALLBACK_PATH, function (req, res) {
  if(req.query.code) {
    let appUrl = `${req.protocol}://${req.get('host')}${CALLBACK_PATH}`
    let redirectUrl =  REDIRECT_URL || env.REDIRECT_URL || ''
    let responseUrl =  redirectUrl || DEMO_URL
    // Pass authorization_code in query parameters for demo app only
    let showAuthcode = redirectUrl ? false : true
    
    unirest.post(TOKEN_URL)
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send({
        "grant_type": "authorization_code",
        "code": req.query.code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": appUrl
      })
      .end((response) => {
        if(response.body.access_token && response.body.refresh_token && response.body.expires_in && responseUrl) {
          let redirectLink = `${responseUrl}?`
          redirectLink += `access_token=${response.body.access_token}`
          redirectLink += `&expires_in=${response.body.expires_in}`
          redirectLink += `&refresh_token=${response.body.refresh_token}`
          redirectLink += showAuthcode ? `&authorization_code=${req.query.code}` : '' // For demo app only
          res.redirect(redirectLink)
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
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
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

app.listen(port, () => { log(`Node (Express) server started on port ${port}`) })