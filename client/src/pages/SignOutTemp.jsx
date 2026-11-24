import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircularProgress, Container } from '@mui/material'
import { useDispatch } from 'react-redux'
import { signOut } from '../features/auth/authSlice'
import AuthAPI from '../API/AuthAPI'
import useToken from '../hooks/useToken'

// Visiting /signout signs the user out and goes to the home page
function SignOutTemp () {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { deleteToken } = useToken()

  useEffect(() => {
    const doSignOut = async () => {
      await AuthAPI.signOut()
      deleteToken()
      dispatch(signOut())
      navigate('/', { replace: true })
    }
    doSignOut()
  }, []) // eslint-disable-line

  return (
    <Container sx={{ py: 6, textAlign: 'center' }}>
      <CircularProgress />
      <br />
      Signing out...
    </Container>
  )
}

export default SignOutTemp
