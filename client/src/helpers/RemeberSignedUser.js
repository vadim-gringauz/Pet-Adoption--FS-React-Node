import React from 'react'
import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CircularProgress, Stack } from '@mui/material'
import useToken from '../hooks/useToken'
import useAuth from '../hooks/useAuth'
import useRefreshToken from '../hooks/useRefreshToken'

// Wraps the pages: when the page is (re)loaded and there is a saved token,
// the user is signed in again before showing the page
function RemeberSignedUser () {
  const [isLoading, setIsLoading] = useState(true)
  const { auth } = useAuth()
  const { loadToken } = useToken()
  const refresh = useRefreshToken()

  useEffect(() => {
    let cancelled = false

    const verifyToken = async () => {
      try {
        await refresh()
      } catch (err) {
        console.log(err)
      } finally {
        // also when the token was not good anymore - otherwise the spinner never ends
        if (!cancelled) setIsLoading(false)
      }
    }

    if (!loadToken() || auth.accessToken) {
      setIsLoading(false)
    } else {
      verifyToken()
    }

    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line

  return (
    <>
      {!isLoading ? (
        <Outlet />
      ) : (
        <Stack mt={10} alignItems={'center'} alignContent={'center'}>
          <CircularProgress size={200} color={'warning'} />
        </Stack>
      )}
    </>
  )
}

export default RemeberSignedUser
