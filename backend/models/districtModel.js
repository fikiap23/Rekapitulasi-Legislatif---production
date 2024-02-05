import mongoose from 'mongoose'

const DistrictSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    villages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Village',
      },
    ],
  },
  { timestamps: true }
)

const District = mongoose.model('District', DistrictSchema)

export default District
