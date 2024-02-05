import jwt from 'jsonwebtoken'

const generateTokenAndSetCookie = (userId, userType, res) => {
  const token = jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  })

  res.cookie('jwt', token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: 'strict', // CSRF
    // sameSite: 'none',
    // secure: true,
  })

  return token
}

export default generateTokenAndSetCookie
