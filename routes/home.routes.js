const Guitar = require('../models/Guitar.model')

const router = require('express').Router()

/* GET home page */
router.get('/', async (req, res, next) => {
  res.render('home')
})

module.exports = router
