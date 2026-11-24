import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Container, Typography } from '@mui/material'
import useAuth from '../hooks/useAuth'

// Only for admins. (The server checks the permission too - this only hides the pages)
function AdminRoute () {
  const { auth } = useAuth()

  if (!auth.isSignedIn) return <Navigate to='/signin' replace />

  if (auth.signedUser?.permission !== 'admin') {
    return (
      <Container maxWidth='md' sx={{ py: 6 }}>
        <Typography variant='h4' component='h1'>
          Admins only
        </Typography>
        <Typography variant='body1'>
          You do not have permission to see this page.
        </Typography>
      </Container>
    )
  }

  return <Outlet />
}

export default AdminRoute
