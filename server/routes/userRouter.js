const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/UsersController')

const authMiddleware = require('../middlewares/authMiddleware')

//! PUBLIC ROUTES:
router.post('/signup', UsersController.signUp)
router.post('/signin', UsersController.signIn)
router.delete('/signout', UsersController.signOut)

//! PROTECTED TO SIGNED USER:
router.post('/refresh', authMiddleware, UsersController.refresh)

//! PROTECTED TO ADMIN:
router.get(
  '/',
  authMiddleware,
  UsersController.isAdmin,
  UsersController.getAllUsers
)

//! PROTECTED TO THE USER HIMSELF (OR ADMIN):
router.get(
  '/:id',
  authMiddleware,
  UsersController.isSelfOrAdmin,
  UsersController.getUserByID,
  UsersController.getOneUser
)
router.patch(
  '/:id',
  authMiddleware,
  UsersController.isSelfOrAdmin,
  UsersController.getUserByID,
  UsersController.updateUser
)

//! PROTECTED TO ADMIN:
router.patch(
  '/:id/make-admin',
  authMiddleware,
  UsersController.isAdmin,
  UsersController.getUserByID,
  UsersController.makeAdmin
)
router.delete(
  '/:id/make-admin',
  authMiddleware,
  UsersController.isAdmin,
  UsersController.getUserByID,
  UsersController.removeAdmin
)
router.delete(
  '/:id',
  authMiddleware,
  UsersController.isAdmin,
  UsersController.getUserByID,
  UsersController.deleteUser
)

module.exports = router
