const UsersDAO = require('./UsersDAO')

module.exports = class AdminDAO {
  static async getAdmins () {
    return await UsersDAO.getAdmins()
  }

  static async makeAdmin (userID) {
    return await UsersDAO.setPermission(userID, 'admin')
  }

  static async removeAdmin (userID) {
    return await UsersDAO.setPermission(userID, 'user')
  }
}
