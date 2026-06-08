import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  let token

  // 1. Vzemi token iz Authorization headerja
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // 2. Preveri da token obstaja
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token'
    })
  }
  console.log("has token",token)

  try {
    console.log("in verify jwt");
    // 3. Verificiraj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("jwt decode:",decoded);
    // 4. Poišči userja v bazi
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found'
      })
    }

    next()
  } catch (err) {
    console.log("jwt error ",err,)
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token'
    })
  }
}

export default protect 