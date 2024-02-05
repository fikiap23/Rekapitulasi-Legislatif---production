// authController.js
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js'
import apiHandler from '../utils/apiHandler.js'
import User from '../models/userModel.js'

const authController = {
  registerAdmin: async (req, res) => {
    try {
      const { username, role = 'admin', password, repassword } = req.body

      if (!username || !role || !password || !repassword) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Username, role, password, and repassword are required',
          error: {
            type: 'MissingCredentials',
            details: 'Username, role, password, and repassword are required',
          },
        })
      }

      const user = await User.findOne({ username: username })
      if (user) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'User already exists',
          error: { type: 'UserExists', details: 'User already exists' },
        })
      }

      if (password !== repassword) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Passwords do not match',
          error: {
            type: 'PasswordMismatch',
            details: 'Passwords do not match',
          },
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const newUser = new User({
        username,
        role,
        password: hashedPassword,
      })
      await newUser.save()

      if (newUser) {
        return apiHandler({
          res,
          status: 'success',
          code: 201,
          message: 'User account created successfully',
          data: {
            _id: newUser._id,
            role: newUser.role,
            username: newUser.username,
          },
        })
      } else {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid user data',
          error: { type: 'InvalidUserData', details: 'Invalid user data' },
        })
      }
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  loginUser: async (req, res) => {
    try {
      let { username, password } = req.body

      if (!username || !password) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Username and password are required',
          error: {
            type: 'MissingCredentials',
            details: 'Username and password are required',
          },
        })
      }

      username = username.toLowerCase()
      const user = await User.findOne({ username: username })

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user?.password || ''
      )

      if (!user || !isPasswordCorrect)
        return res.status(400).json({ error: 'Invalid username or password' })

      if (user.role == 'admin') {
        generateTokenAndSetCookie(user._id, 'admin', res)
        return apiHandler({
          res,
          status: 'success',
          code: 200,
          message: 'Admin logged in successfully',
          data: {
            _id: user._id,
            name: user.name,
            role: user.role,
            username: user.username,
          },
        })
      } else if (user.role == 'user_tps') {
        generateTokenAndSetCookie(user._id, 'user_tps', res)
        return apiHandler({
          res,
          status: 'success',
          code: 200,
          message: 'User logged in successfully',
          data: {
            _id: user._id,
            role: user.role,
            name: user.name,
            username: user.username,
            tps_id: user.tps_id,
          },
        })
      } else {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid role',
          error: { type: 'InvalidRole', details: 'Invalid role' },
        })
      }
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  logoutUser: (req, res) => {
    try {
      res.cookie('jwt', '', { maxAge: 1 })
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'User logged out successfully',
        data: null,
        error: null,
      })
    } catch (err) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: err.message },
      })
    }
  },
}

export default authController
