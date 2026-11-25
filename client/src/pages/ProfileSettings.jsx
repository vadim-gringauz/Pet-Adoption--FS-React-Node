import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Container, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import UserAPI from '../API/UserAPI'
import useAuth from '../hooks/useAuth'
import { updateSignedUser } from '../features/auth/authSlice'
import Notice from '../components/Notice'

function ProfileSettings () {
  const dispatch = useDispatch()
  const { auth } = useAuth()
  const { signedUser } = auth

  const [notice, setNotice] = useState({ open: false })
  const [saving, setSaving] = useState(false)

  const showError = message => setNotice({ open: true, severity: 'error', message })

  const handleSubmit = async event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    // only send what changed
    const changes = {}
    for (const field of ['firstName', 'lastName', 'email', 'phone']) {
      const value = data.get(field).trim()
      if (value !== (signedUser[field] ?? '')) changes[field] = value
    }
    if (changes.email === '') return showError('The email cannot be empty')

    const newPassword = data.get('newPassword')
    if (newPassword) {
      if (newPassword.length < 6) {
        return showError('The password must have at least 6 characters')
      }
      if (newPassword !== data.get('newPasswordVerify')) {
        return showError('The passwords do not match')
      }
      changes.password = newPassword
    }

    if (Object.keys(changes).length === 0) {
      return setNotice({ open: true, severity: 'info', message: 'Nothing to update' })
    }

    setSaving(true)
    const result = await UserAPI.updateUser(signedUser._id, changes)
    setSaving(false)

    if (!result.success) return showError(result.message)

    dispatch(updateSignedUser(result.user))
    event.target.reset()
    setNotice({ open: true, severity: 'success', message: 'Your profile was updated' })
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          Profile / Account
        </Typography>

        <Paper
          component='form'
          elevation={4}
          sx={{ p: 3 }}
          onSubmit={handleSubmit}
          // the form is re-created when the user changes, to show the saved values
          key={`${signedUser.email}${signedUser.firstName}${signedUser.lastName}${signedUser.phone}`}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First name'
                name='firstName'
                defaultValue={signedUser.firstName ?? ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last name'
                name='lastName'
                defaultValue={signedUser.lastName ?? ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                name='email'
                type='email'
                defaultValue={signedUser.email ?? ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone'
                name='phone'
                defaultValue={signedUser.phone ?? ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6'>Change password (optional)</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='New password'
                name='newPassword'
                type='password'
                autoComplete='new-password'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Repeat new password'
                name='newPasswordVerify'
                type='password'
                autoComplete='new-password'
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={saving}>
                Save changes
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
      <Notice notice={notice} setNotice={setNotice} />
    </Container>
  )
}

export default ProfileSettings
