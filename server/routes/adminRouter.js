const express = require('express')
const router = express.Router()

const AdminController = require('../controllers/AdminController')
const UsersController = require('../controllers/UsersController')
const authMiddleware = require('../middlewares/authMiddleware')

//! PROTECTED TO ADMIN:
// return all admins
router.get(
  '/',
  authMiddleware,
  UsersController.isAdmin,
  AdminController.getAdmins
)

module.exports = router
