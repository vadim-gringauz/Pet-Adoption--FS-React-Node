const sha256 = require('js-sha256')
const jwt = require('jsonwebtoken')
const UsersDAO = require('../models/UsersDAO')
const logger = require('../utils/logger')
const {
  signInValidation,
  signUpValidation,
  updateValidation
} = require('../validations/usersValidations')

const TOKEN_EXPIRES_IN = '7d'

const createAccessToken = user =>
  jwt.sign(
    {
      _id: user._id,
      email: user.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  )

// The user data that is safe to send back to the client (no password hash)
const toSignedUser = user => ({
  _id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar,
  phone: user.phone,
  createdAt: user.createdAt,
  permission: user.permission,
  petsWishList: user.petsWishList,
  settings: user.settings
})

const isDuplicateKeyError = err => err && err.code === 11000

module.exports = class UsersController {
  // AUTH RELATED
  static async signUp (req, res) {
    //
    try {
      const validRequest = signUpValidation(req.body)
      if (!validRequest)
        return res.status(400).json({
          success: false,
          message: '❌ Please fill all fields (password: at least 6 characters)'
        })

      if (
        req.body.passwordVerify !== undefined &&
        req.body.password !== req.body.passwordVerify
      ) {
        return res.status(400).json({
          success: false,
          message: '❌ Passwords do not match'
        })
      }

      const existingUser = await UsersDAO.getUserByEmail(req.body.email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: '❌ This email is already registered'
        })
      }

      const newUserObject = {
        email: req.body.email,
        password: sha256(req.body.password),
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
        avatar: null,
        phone: req.body.phone || null,
        settings: {
          darkMode: false
        }
      }

      const newUserID = await UsersDAO.createUser(newUserObject)
      return res.status(201).json({
        success: true,
        message: '✅ New user signed up successfully',
        newUserID: newUserID
      })
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        return res.status(409).json({
          success: false,
          message: '❌ This email is already registered'
        })
      }
      logger('UsersController.signUp', err)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  static async signIn (req, res) {
    try {
      res.clearCookie('cookie-session')

      const validRequest = signInValidation(req.body)
      if (!validRequest)
        return res.status(400).json({
          success: false,
          message: '❌ Please fill all fields'
        })

      const user = await UsersDAO.getUserByEmail(req.body.email)
      if (!user || user.password != sha256(req.body.password)) {
        return res.status(401).json({
          success: false,
          message: '❌ Wrong username or password'
        })
      }

      //! EMAIL + PASSWORD ARE VALID AND APPROVED => CREATE TOKEN
      res.status(200).json({
        accessToken: createAccessToken(user),
        signedUser: toSignedUser(user)
      })
    } catch (err) {
      logger('UsersController.signIn', `Error in UsersController.Login ${err}`)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  static async refresh (req, res) {
    try {
      const user = await UsersDAO.getUserByID(req.currentUser._id)
      if (!user) {
        logger('UsersController.refresh', 'user not found')
        return res.status(404).json({
          success: false,
          message: '❌ Cannot find user'
        })
      }

      res.status(200).json({
        accessToken: createAccessToken(user),
        signedUser: toSignedUser(user)
      })
    } catch (err) {
      logger(
        'UsersController.refresh',
        `Error in UsersController.refresh ${err}`
      )
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  static async signOut (req, res) {
    // Tokens are kept on the client, so signing out = the client forgets the token
    return res.status(200).json({
      success: true,
      message: '✅ User signed out successfully'
    })
  }

  // DB RELATED
  static async getUserByID (req, res, next) {
    let result
    try {
      result = await UsersDAO.getUserByID(req.params.id)
      if (!result) {
        logger('UsersController.getUserByID', 'user not found')
        return res.status(404).json({
          success: false,
          message: '❌ Cannot find user'
        })
      }
    } catch (err) {
      logger('UsersController.getUserByID', err.message)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }

    req.user = result
    next()
  }

  static getOneUser (req, res) {
    return res.status(200).json({ user: toSignedUser(req.user) })
  }

  static async getAllUsers (req, res) {
    try {
      const result = await UsersDAO.getAll()
      return res.status(200).json({ users: result })
    } catch (err) {
      logger('UsersController.getAllUsers', err.message)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  static async updateUser (req, res) {
    try {
      const validRequest = updateValidation(req.body)
      if (!validRequest)
        return res.status(400).json({
          success: false,
          message: '❌ Fields not valid'
        })

      const updateFields = { ...req.body }
      if (updateFields.password) {
        updateFields.password = sha256(updateFields.password)
      }

      await UsersDAO.updateUser(req.user._id, updateFields)
      const updatedUser = await UsersDAO.getUserByID(req.user._id)
      return res.status(200).json({
        success: true,
        user: toSignedUser(updatedUser)
      })
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        return res.status(409).json({
          success: false,
          message: '❌ This email is already registered'
        })
      }
      logger('UsersController.updateUser', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async deleteUser (req, res) {
    try {
      await UsersDAO.deleteUser(req.user._id)

      return res.status(200).json({
        success: true,
        message: `✅ User (${req.user._id} deleted succesfully)`
      })
    } catch (err) {
      logger('UsersController.deleteUser', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async addPetToWishList (req, res) {
    const { currentUser, pet } = req

    try {
      const result = await UsersDAO.addPetToWishList(currentUser._id, pet._id)

      if (result.modifiedCount === 0) {
        logger('UsersController.addPetToWishList', '❌ Pet already exists')
        return res.status(409).json({
          success: false,
          message: '❌ Pet already exists'
        })
      }

      return res.status(200).json({
        success: true,
        user: currentUser.email,
        petAddedToWishList: pet.name
      })
    } catch (err) {
      logger('UsersController.addPetToWishList', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async removePetFromWishList (req, res) {
    const { currentUser, pet } = req

    try {
      const result = await UsersDAO.removePetFromWishList(
        currentUser._id,
        pet._id
      )

      if (result.modifiedCount === 0) {
        logger(
          'UsersController.removePetFromWishList',
          '❌ Pet was not in wish list'
        )
        return res.status(404).json({
          success: false,
          message: '❌ Pet was not in wish list'
        })
      }

      return res.status(200).json({
        success: true,
        user: currentUser.email,
        petRemovedFromWishList: pet.name
      })
    } catch (err) {
      logger('UsersController.removePetFromWishList', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  // PERMISSIONS RELATED
  static async isAdmin (req, res, next) {
    try {
      const { currentUser } = req
      const fullUserData = await UsersDAO.getUserByID(currentUser._id)
      if (!fullUserData || fullUserData.permission !== 'admin') {
        logger('UserController.isAdmin', '❌ Not admin - access denied')
        return res.status(403).json({
          success: false,
          message: '❌ Not admin - access denied'
        })
      }

      next()
    } catch (err) {
      logger('UserController.isAdmin', err.message)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  // Allows the request only if the signed user is the user in the URL, or an admin
  static async isSelfOrAdmin (req, res, next) {
    try {
      const { currentUser } = req
      if (String(currentUser._id) === String(req.params.id)) return next()

      const fullUserData = await UsersDAO.getUserByID(currentUser._id)
      if (!fullUserData || fullUserData.permission !== 'admin') {
        logger('UserController.isSelfOrAdmin', '❌ access denied')
        return res.status(403).json({
          success: false,
          message: '❌ You can only access your own data'
        })
      }

      next()
    } catch (err) {
      logger('UserController.isSelfOrAdmin', err.message)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }

  static async makeAdmin (req, res) {
    try {
      await UsersDAO.setPermission(req.user._id, 'admin')
      return res.status(200).json({
        success: true,
        message: `✅ ${req.user.email} is now an admin`
      })
    } catch (err) {
      logger('UsersController.makeAdmin', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async removeAdmin (req, res) {
    try {
      if (String(req.user._id) === String(req.currentUser._id)) {
        return res.status(400).json({
          success: false,
          message: '❌ You cannot remove your own admin permission'
        })
      }

      await UsersDAO.setPermission(req.user._id, 'user')
      return res.status(200).json({
        success: true,
        message: `✅ ${req.user.email} is no longer an admin`
      })
    } catch (err) {
      logger('UsersController.removeAdmin', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }
}
