import User from '../models/userModel.js'
import Tps from '../models/tpsModel.js'
import bcrypt from 'bcryptjs'
import apiHandler from '../utils/apiHandler.js'

const userController = {
  createNewUser: async (req, res) => {
    try {
      const { password, role, tps_id } = req.body
      let { username } = req.body

      // check user
      const user = await User.findById(req.user._id)

      // check users must be admin
      if (!user) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'User not found',
          error: null,
        })
      }

      if (user.role !== 'admin') {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Only admins can create users',
          error: null,
        })
      }

      if (!username || !password) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Username and password are required',
          error: null,
        })
      }

      // Pemeriksaan spasi dalam username
      if (username.includes(' ')) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Username cannot contain spaces',
          error: null,
        })
      }

      username = username.toLowerCase()

      //   Check if user already exists
      const userExists = await User.findOne({ username })
      if (userExists) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'User already exists',
          error: null,
        })
      }

      // check what user wants to create
      if (role === 'admin') {
        // Admin user
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
          username,
          password: hashedPassword,
          role,
        })
        await newUser.save()

        return apiHandler({
          res,
          status: 'success',
          code: 201,
          message: 'Admin user created successfully',
          data: {
            _id: newUser._id,
            username: newUser.username,
            role: newUser.role,
          },
          error: null,
        })
      } else if (role === 'user_tps') {
        // check if tps_id
        const tps = await Tps.findById(tps_id)
        if (!tps) {
          return apiHandler({
            res,
            status: 'error',
            code: 400,
            message: 'TPS not found',
            error: null,
          })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
          username,
          password: hashedPassword,
          role,
          tps_id,
          village_id: tps.village_id,
          district_id: tps.district_id,
        })
        await newUser.save()

        const savedUser = await User.findOne({ _id: newUser._id })
          .select('-password')
          .populate('village_id', 'name')
          .populate('district_id', 'name')
          .populate('tps_id', 'number')

        return apiHandler({
          res,
          status: 'success',
          code: 201,
          message: 'User created successfully',
          data: {
            _id: savedUser._id,
            username: savedUser.username,
            role: savedUser.role,
            village_name: savedUser.village_id?.name,
            district_name: savedUser.district_id?.name,
            tps_number: savedUser.tps_id?.number,
          },
          error: null,
        })
      } else {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid role',
          error: null,
        })
      }
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
  getAllUsers: async (req, res) => {
    try {
      // check user
      const user = await User.findById(req.user._id)
      if (!user) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'User not found',
          error: null,
        })
      }

      let users

      // check role
      if (user.role === 'admin') {
        users = await User.find()
          .select('-password')
          .populate('village_id', 'name')
          .populate('district_id', 'name')
          .populate('tps_id', 'number')
      }

      // transform data
      users = users.map((user) => {
        return {
          _id: user._id,
          username: user.username,
          role: user.role,
          village_name: user.village_id?.name,
          district_name: user.district_id?.name,
          tps_number: user.tps_id?.number,
          village_id: user.village_id?._id,
          district_id: user.district_id?._id,
          tps_id: user.tps_id?._id,
        }
      })

      // Return the list of users
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'List of all users retrieved successfully',
        data: users,
        error: null,
      })
    } catch (error) {
      // Handle errors
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.params.userId
      const { password, role, tps_id } = req.body
      let { username } = req.body

      // Check if userId is provided
      if (!userId) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'User ID is required for update',
          error: null,
        })
      }

      // Pemeriksaan spasi dalam username
      if (username.includes(' ')) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Username cannot contain spaces',
          error: null,
        })
      }

      // Find the user by ID
      const user = await User.findById(userId)

      // Check if the user exists
      if (!user) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'User not found',
          error: null,
        })
      }

      // Check if the username is being updated and not already taken
      if (username && username !== user.username) {
        const userExists = await User.findOne({ username })
        if (userExists) {
          return apiHandler({
            res,
            status: 'error',
            code: 400,
            message: 'Username already exists',
            error: null,
          })
        }
        username = username.toLowerCase()
      }

      // Update user properties if provided
      if (username) user.username = username
      if (password) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
      }

      if (role === 'user_tps') {
        const tps = await Tps.findById(tps_id)
        user.role = role
        user.tps_id = tps._id
        user.district_id = tps.district_id
        user.village_id = tps.village_id
      } else if (role === 'admin') {
        user.role = role
        user.district_id = null
        user.village_id = null
        user.tps_id = null
      } else {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid role',
          error: null,
        })
      }

      // Save the updated user
      await user.save()

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'User updated successfully',
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
          district_id: user.district_id,
          village_id: user.village_id,
        },
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userId = req.params.userId

      // Check if userId is provided
      if (!userId) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'User ID is required for deletion',
          error: null,
        })
      }

      // Find the user by ID
      const user = await User.findById(userId)

      // Check if the user exists
      if (!user) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'User not found',
          error: null,
        })
      }

      // Perform the deletion
      await User.findByIdAndDelete(userId)

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'User deleted successfully',
        data: null,
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  deleteUsers: async (req, res) => {
    try {
      const userIds = req.body

      // Check if userIds array is provided
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'User IDs array is required for deletion',
          error: null,
        })
      }

      // Find the users by IDs
      const users = await User.find({ _id: { $in: userIds } })

      // Check if all users exist
      if (users.length !== userIds.length) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'One or more users not found',
          error: null,
        })
      }

      // Perform the deletion
      await User.deleteMany({ _id: { $in: userIds } })

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Users deleted successfully',
        data: null,
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
}

export default userController
