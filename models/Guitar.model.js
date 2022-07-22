const { Schema, model } = require('mongoose')

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const guitarSchema = new Schema(
  {
    brand: {
      type: String,
      required: [true, 'You need to provide a  brand'],
    },

    model: {
      type: String,
      required: [true, 'You need to provide a model for your guitar'],
    },

    nickName: {
      type: String,
      required: [true, 'You need a nickname for your guitar'],
    },

    type: {
      type: String,
      enum: ['Electric', 'Classic', 'Acoustic'],
    },

    image: String,

    fingerboardMaterial: String,

    artists: String,

    year: Number,

    countryOrigin: String,

    pickupConfig: String,

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
)

const Guitar = model('Guitar', guitarSchema) // fixed typo

module.exports = Guitar
