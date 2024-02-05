import mongoose from 'mongoose'

const candidateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const partySchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    number_party: { type: Number, required: true, unique: true },
    path: { type: String, required: true },
    logo_url: { type: String, required: true },

    candidates: [candidateSchema],
  },
  { timestamps: true }
)

const Party = mongoose.model('Party', partySchema)

export default Party
