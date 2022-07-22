const router = require('express').Router()

//Required for Schemas
const Guitar = require('../models/Guitar.model')
const User = require('../models/User.model')

//READ list of all guitars
router.get('/', async (req, res, next) => {
  try {
    const guitarList = await Guitar.find().populate('user')
    res.render('all-profiles/beauties-collection', { guitarList })
  } catch (error) {
    console.log('error while retrieving list of guitars from DB ,', error)
    next()
  }
})

router.get('/collection/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    const collection = await Guitar.find({ user: user._id })
    res.render('all-profiles/user-beauties', { collection, user })
  } catch (error) {
    console.log('Error finding your beauties: ', error)
  }
})

router.get('/:guitarId', async (req, res, next) => {
  try {
    const guitar = await Guitar.findById(req.params.guitarId).populate('user')
    res.render('all-profiles/beauty-details', guitar)
  } catch (error) {
    console.log('Error finding guitar: ', error)
  }
})

module.exports = router
