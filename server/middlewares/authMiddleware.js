const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

async function authMiddleware (req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
      logger('authMiddleware', 'no token')
      return res.status(401).json({
        success: false,
        message: '❌ Not signed in'
      })
    }

    let tokenData
    try {
      tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (err) {
      logger('authMiddleware', 'Token is not valid or expired')
      return res.status(401).json({
        success: false,
        message: '❌ Invalid or expired token'
      })
    }

    //! Token is valid
    req.currentUser = tokenData
    req.token = token
    next()
  } catch (err) {
    logger('authMiddleware', err.message)
    return res.status(500).json({
      success: false,
      message: '❌ Unknown error'
    })
  }
}

module.exports = authMiddleware
