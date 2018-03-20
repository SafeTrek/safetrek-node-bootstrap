# SafeTrek Node Bootstrap

A bootstrap project to quickly get you started with the SafeTrek API using NodeJS.

### How to use

 - **Step 1:** [Request Access](https://developers.safetrek.io/) to SafeTrek API in order to get your `client_id` and `client_secret`
 - **Step 2:** [Create](https://www.heroku.com/) a free Heroku account, if you don't have one already.
 - **Step 3:** Use the *Deploy to Heroku* button below to create your new app off of this repository. Give your app a name and fill in your SafeTrek API credentials that you received from *Step 1*. Fill in the `REDIRECT_URL` only if you know what you're doing. If this is your first time using this repo, leave it blank.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/SafeTrek/safetrek-node-bootstrap/tree/develop)

- **Step 4:** Open up the app and go through the demo if you're new to working with SafeTrek API. The console outputs can give additional information during the demo, so keep an eye out for that.
- **STEP 5:** Go through the code to better understand how everything works. Create issues if you have any queries or find any bugs.

### More Info

- Currently, contributions to this repository are not being accepted.
- The `/callback` path on all `*.herokuapp.com` domain URLs have been whitelisted for making secure calls to the SafeTrek API. If you want to whitelist a custom path or domain, please contact us.