const AdminDAO = require('../models/AdminDAO')
const logger = require('../utils/logger')

module.exports = class AdminController {
  static async getAdmins (req, res) {
    try {
      const admins = await AdminDAO.getAdmins()
      return res.status(200).json({ admins })
    } catch (err) {
      logger('AdminController.getAdmins', err.message)
      return res.status(500).json({
        success: false,
        message: '❌ Unknown error'
      })
    }
  }
}
