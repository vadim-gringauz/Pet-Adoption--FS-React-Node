import axios from 'axios'

export const TOKEN_KEY = 'access-token'
export const SERVER_URL =
  process.env.REACT_APP_SERVER_URL || 'http://localhost:3005'

const instance = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true
})

// Every request carries the signed user's token (when there is one)
instance.interceptors.request.use(config => {
  let token = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch (err) {}

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
