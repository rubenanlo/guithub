// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config')

// ℹ️ Connects to the database
require('./db')

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express')

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs')

const app = express()

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app)

const capitalized = require('./utils/capitalized')
const projectName = 'guithub'

app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`

// expose session data for handlebars
app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

// 👇 Start handling routes here
const home = require('./routes/home.routes')
app.use('/', home)

const authRoutes = require('./routes/auth.routes')
app.use('/auth', authRoutes)

const profile = require('./routes/profile.routes')
app.use('/profile', profile)
const guitars = require('./routes/guitar.routes')
app.use('/guitars', guitars)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app
