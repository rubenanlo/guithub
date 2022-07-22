const router = require('express').Router()
const fileUploader = require('../config/cloudinary.config')

const User = require('../models/User.model')
const Guitar = require('../models/Guitar.model')
const isLoggedIn = require('../middleware/isLoggedIn')

router.get('/myCollection', isLoggedIn, async (req, res, next) => {
  try {
    const myCollection = await Guitar.find({ user: req.session.user._id })
    const viewObject = !myCollection[0] ? {} : { myCollection }
    res.render('my-guitars/guitars', viewObject)
  } catch (error) {
    console.log('Error finding guitar: ', error)
  }
})

// CREATE: Render form
router.get('/create-guitar', isLoggedIn, async (req, res, next) => {
  try {
    const typeOptions = ['Electric', 'Classic', 'Acoustic']
    const user = req.session.user
    res.render('my-guitars/guitar-create', { typeOptions, user })
  } catch (error) {
    console.log('Error getting users from DB', error)
    next(error)
  }
})

// CREATE: Process form
router.post('/create-guitar', fileUploader.single('image'), isLoggedIn, async (req, res, next) => {
  const newGuitar = {
    nickName: req.body.nickName,
    brand: req.body.brand,
    model: req.body.model,
    countryOrigin: req.body.countryOrigin,
    type: req.body.type,
    year: req.body.year,
    fingerboardMaterial: req.body.fingerboardMaterial,
    pickupConfig: req.body.pickupConfig,
    artists: req.body.artists,
    image: req.file ? req.file.path : undefined,
    user: req.session.user._id,
  }

  const typeOptions = ['Electric', 'Classic', 'Acoustic']

  if (!newGuitar.nickName || !newGuitar.brand || !newGuitar.model) {
    return res.status(400).render('my-guitars/guitar-create', {
      typeOptions,
      errorMessage:
        "Hey! Guitars were born with a nickname, brand, model and a type. Please don't forget to add them all!",
    })
  }

  try {
    await Guitar.create(newGuitar)
    res.redirect('/profile/myCollection')
  } catch (error) {
    console.log('Error creating guitar in the DB', error)
    next(error)
  }
})

// READ: Guitar details
router.get('/guitar/:guitarId', async (req, res, next) => {
  try {
    const guitarDetails = await Guitar.findById(req.params.guitarId)
    res.render('my-guitars/guitar-details', guitarDetails)
  } catch (error) {
    console.log('Error getting guitar details from DB', error)
    next(error)
  }
})

// UPDATE: Render form
router.get('/guitar/:guitarId/edit', isLoggedIn, async (req, res, next) => {
  const typeOptions = ['Electric', 'Classic', 'Acoustic']

  try {
    const guitarDetails = await Guitar.findById(req.params.guitarId)
    res.render('my-guitars/guitar-edit', { guitarDetails, typeOptions })
  } catch (error) {
    console.log('Error getting guitar details from DB', error)
    next(error)
  }
})

// UPDATE: Process form
router.post('/guitar/:guitarId/edit', fileUploader.single('image'), isLoggedIn, async (req, res, next) => {
  try {
    const { image } = await Guitar.findById(req.params.guitarId)
    const newDetails = {
      nickName: req.body.nickName,
      brand: req.body.brand,
      model: req.body.model,
      countryOrigin: req.body.countryOrigin,
      type: req.body.type,
      year: req.body.year,
      fingerboardMaterial: req.body.fingerboardMaterial,
      pickupConfig: req.body.pickupConfig,
      image: req.file ? req.file.path : image,
      artists: req.body.artists,
      user: req.session.user._id,
    }
    await Guitar.findByIdAndUpdate(req.params.guitarId, newDetails)
    res.redirect('/profile/myCollection')
  } catch (error) {
    console.log('Error updating guitar in DB', error)
    next(error)
  }
})

// DELETE: delete guitar
router.post('/guitar/:guitarId/delete', isLoggedIn, async (req, res, next) => {
  try {
    await Guitar.findByIdAndRemove(req.params.guitarId)
    res.redirect('/profile/myCollection')
  } catch (error) {
    console.log('Error deleting guitar from DB', error)
    next(error)
  }
})

// READ Profile details
router.get('/:userId', isLoggedIn, async (req, res, next) => {
  const userId = req.params.userId
  try {
    const user = await User.findById(userId)
    res.render('profile/profile-page', user)
  } catch (error) {
    console.log('error while retrieving the user from DB ,', error)
    next()
  }
})

// EDIT Profile
router.get('/:userId/edit', isLoggedIn, async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.params.userId)
    res.render('profile/profile-edit', userDetails)
  } catch (error) {
    console.log('error while retrieving user from DB ,', error)
    next()
  }
})

router.post('/:userId/edit', fileUploader.single('imagePhoto'), isLoggedIn, async (req, res, next) => {
  try {
    const { imagePhoto } = await User.findById(req.params.userId)
    const newUserDetails = {
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      country: req.body.country,
      favArtists: req.body.favArtists,
      favGenres: req.body.favGenres,
      setup: req.body.setup,
      description: req.body.description,
      imagePhoto: req.file ? req.file.path : imagePhoto,
      user: req.session.user._id,
    }
    const updatedDetails = await User.findByIdAndUpdate(req.params.userId, newUserDetails, { new: true })
    res.render('profile/profile-page', updatedDetails)
  } catch (error) {
    console.log('Error updating user in DB', error)
    next(error)
  }
})

//DELETE Profile
router.post('/:userId/delete', isLoggedIn, async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('auth/logout', { errorMessage: err.message })
    }
  })
  try {
    await Guitar.deleteMany({ user: req.params.userId })
    await User.findByIdAndRemove(req.params.userId)
    res.redirect('/')
  } catch (error) {
    console.log('Error deleting user from DB', error)
    next(error)
  }
})

module.exports = router
