import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user_tps', 'admin'],
      required: true,
      default: '',
    },

    tps_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tps',
      required: function () {
        return this.role === 'user_tps'
      },
    },
    village_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village',
    },
    district_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

export default User
