import axios from '../config/axios'
import request from './request'

class UserAPI {
  // Admin only => { success, users }
  static async getAllUsers () {
    return request(() => axios.get('/user/'))
  }

  // => { success, user }
  static async getOneUser (userID) {
    return request(() => axios.get(`/user/${userID}`))
  }

  // => { success, user } (the updated user)
  static async updateUser (userID, newUserData) {
    return request(() => axios.patch(`/user/${userID}`, newUserData))
  }

  // Admin only
  static async makeUserAdmin (userID) {
    return request(() => axios.patch(`/user/${userID}/make-admin`))
  }

  // Admin only
  static async removeAdmin (userID) {
    return request(() => axios.delete(`/user/${userID}/make-admin`))
  }

  // Admin only
  static async deleteUser (userID) {
    return request(() => axios.delete(`/user/${userID}`))
  }
}

export default UserAPI
