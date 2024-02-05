// middleware.js
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

const protectAdminRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.userType === 'admin') {
      const admin = await User.findById(decoded.userId).select('-password')
      if (!admin) return res.status(401).json({ message: 'Unauthorized' })
      req.user = admin
      next()
    } else {
      return res.status(401).json({ message: 'Invalid user type in token' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log('Error in protectAdminRoute: ', err.message)
  }
}

const protectUserTpsRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt

    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.userType === 'admin' || decoded.userType === 'user_tps') {
      const user = await User.findById(decoded.userId).select('-password')
      if (!user) return res.status(401).json({ message: 'Unauthorized' })
      req.user = user
      next()
    } else {
      return res.status(401).json({ message: 'Invalid user type in token' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
    console.log('Error in protectUserTpsRoute: ', err.message)
  }
}

export { protectUserTpsRoute, protectAdminRoute }
