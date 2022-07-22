require('dotenv/config')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost/guitar-project'

module.exports = MONGO_URI
