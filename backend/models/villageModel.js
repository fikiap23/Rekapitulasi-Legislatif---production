import mongoose from 'mongoose'
const VillageSchema = mongoose.Schema(
  {
    district_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
    },
    district_code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },

    tps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tps',
      },
    ],
  },
  { timestamps: true }
)

const Village = mongoose.model('Village', VillageSchema)

export default Village
