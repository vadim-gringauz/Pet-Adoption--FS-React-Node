import AuthAPI from '../API/AuthAPI'
import useAuth from './useAuth'
import useToken from './useToken'

// Signs the user in and keeps the session (redux + token in the local storage)
// => { success: true } or { success: false, message }
export default function useSignIn () {
  const { setAuth } = useAuth()
  const { saveToken } = useToken()

  return async credentials => {
    const result = await AuthAPI.signIn(credentials)
    if (!result.success || !result.accessToken) {
      return {
        success: false,
        message:
          result.status === 401 || result.status === 400
            ? 'Wrong email or password'
            : result.message
      }
    }

    saveToken(result.accessToken)
    setAuth(result.signedUser, result.accessToken)
    return { success: true }
  }
}
