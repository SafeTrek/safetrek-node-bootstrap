
# SafeTrek Node Bootstrap

A bootstrap project to get you started with the SafeTrek API using NodeJS.

## Get Started
To get started with the SafeTrek API, you’ll need to do three things:
- Create or access your [Heroku](https://www.heroku.com/) account.

- [Request access](https://developers.safetrek.io/request-access) to get your `client_id` and `client_secret` from SafeTrek.

- Use the _Deploy to Heroku_ button below to create your new app off of this repository.
	- Give your app a name and fill in your SafeTrek API credentials that you received.
	- If this is your first time using this repo, leave the `REDIRECT_URL` blank.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/SafeTrek/safetrek-node-bootstrap)

## Integrate  
A few more quick steps to get you up and going:

- Once deployed, go through the demo experience to better understand how to integrate SafeTrek into your app so that you can provide peace of mind to your users.

  - **TIP:** Be sure to keep an eye out for the console outputs during the demo.

- When you’ve gone through the code and gotten the hang of it, fork this repo to your own GitHub account.

- Connect the forked repo to your Heroku app from the **Deploy** menu on Heroku's dashboard.

  -  `https://dashboard.heroku.com/apps/<YOUR-APP-NAME>/deploy/github`

- Deploy any branch from your forked repo to your Heroku app. (You can even setup auto-deploy if you want 😎 ). Just clone your forked repo to push any changes.

- For testing on `localhost`, create a file named `.env` in the root directory and set your SafeTrek API credentials as below (no quotes or spaces):

```
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
```

- Make sure you have [npm](https://www.npmjs.com/get-npm) installed on your system.

- Next, execute `npm install` followed by `npm start`

What life-saving integration will you create?

**Questions? Suggestions? Bugs? [Create an issue](https://github.com/SafeTrek/safetrek-node-bootstrap/issues/new) or [Email Us](mailto:developers@safetrekapp.com/?subject=[Query]%20SafeTrek%20Node%20Bootstrap).**

## The Fine Print
- Currently, contributions to this repository are not being accepted.

- The `/callback` path on the following URLs have been whitelisted for making secure calls to the SafeTrek API.
  - `https://*.herokuapp.com`
  - `http://localhost:3000`
  - `http://localhost:5000`
  - `http://localhost:8000`
  - `http://localhost:8080`

- If you want to whitelist a custom path or domain, please contact us.
