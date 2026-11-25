import useAuth from './useAuth'
import AuthAPI from '../API/AuthAPI'
import useToken from './useToken'

const useRefreshToken = () => {
  const { setAuth } = useAuth()
  const { loadToken, saveToken, deleteToken } = useToken()

  // Returns true when the stored token is still good (and the user is signed in)
  const refresh = async () => {
    const tokenFromStorage = loadToken()
    if (!tokenFromStorage) return false

    const data = await AuthAPI.refresh(tokenFromStorage)
    if (!data.success) {
      // token expired / not valid anymore - forget it
      deleteToken()
      return false
    }

    saveToken(data.accessToken)
    setAuth(data.signedUser, data.accessToken)
    return true
  }

  return refresh
}

export default useRefreshToken
