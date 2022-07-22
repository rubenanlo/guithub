const router = require('express').Router()

// ℹ️ Handles password encryption
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10

// Require the User model in order to interact with the database
const User = require('../models/User.model')

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require('../middleware/isLoggedOut')
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/signup', isLoggedOut, (req, res) => {
  res.render('auth/signup')
})

router.post('/signup', isLoggedOut, async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).render('auth/signup', {
      errorMessage: 'All spaces are required for sign up.',
    })
  }

  //   ! This use case is using a regular expression to control for special characters and min length
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/

  if (!regex.test(password)) {
    return res.status(400).render('auth/signup', {
      errorMessage:
        'Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.',
    })
  }

  try {
    // Search the database for a user with the username submitted in the form
    const found = await User.findOne({ username, email })

    // If the user is found, send the message username is taken
    if (found) {
      return res.status(400).render('auth/signup', { errorMessage: 'Username and/or email already taken.' })
    }
    // if user is not found, create a new user - start with hashing the password
    const newUser = await bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          email,
          password: hashedPassword,
        })
      })
    // Bind the user to the session object
    req.session.user = newUser
    res.redirect('/guitars')
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).render('auth/signup', { errorMessage: error.message })
    }
    if (error.code === 11000) {
      return res.status(400).render('auth/signup', {
        errorMessage: 'Username need to be unique. The username you chose is already in use.',
      })
    }
    return res.status(500).render('auth/signup', { errorMessage: error.message })
  }
})

router.get('/login', isLoggedOut, (req, res) => {
  res.render('auth/login')
})

router.post('/login', isLoggedOut, async (req, res, next) => {
  const { user, password } = req.body

  if (!user) {
    return res.status(400).render('auth/login', {
      errorMessage: 'Please provide your username.',
    })
  }
  try {
    // Search the database for a user with the username submitted in the form
    const foundByUsername = await User.findOne({ username: user })
    const foundByEmail = await User.findOne({ email: user })
    const foundUser = foundByUsername ? foundByUsername : foundByEmail
    // If the user isn't found, send the message that user provided wrong credentials
    if (!foundUser) {
      return res.status(400).render('auth/login', {
        errorMessage: 'Wrong credentials.',
      })
    }

    // If user is found based on the username, check if the in putted password matches the one saved in the database
    const isSamePassword = await bcrypt.compare(password, foundUser.password)
    if (!isSamePassword) {
      return res.status(400).render('auth/login', {
        errorMessage: 'Wrong credentials.',
      })
    }
    req.session.user = foundUser
    // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
    return res.redirect('/guitars')
  } catch (err) {
    // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
    // you can just as easily run the res.status that is commented out below
    next(err)
    // return res.status(500).render("login", { errorMessage: err.message });
  }
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('auth/logout', { errorMessage: err.message })
    }
    res.redirect('/')
  })
})

module.exports = router
