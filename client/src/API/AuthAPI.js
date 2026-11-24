import axios from '../config/axios'
import request from './request'

class AuthAPI {
  // => { success, newUserID } or { success: false, message }
  static async signUp (newUserData) {
    return request(() => axios.post('/user/signup', newUserData))
  }

  // => { success, accessToken, signedUser } or { success: false, message }
  static async signIn (credentials) {
    const { email, password } = credentials
    return request(() => axios.post('/user/signin', { email, password }))
  }

  // => { success, accessToken, signedUser } or { success: false, message }
  static async refresh (accessToken) {
    return request(() =>
      axios.post('/user/refresh', null, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    )
  }

  static async signOut () {
    return request(() => axios.delete('/user/signout'))
  }
}

export default AuthAPI
