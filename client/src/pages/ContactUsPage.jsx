import React, { useState } from 'react'
import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'

// Set REACT_APP_CONTACT_EMAIL (client/.env) to the address that gets the messages
const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL

// The message opens in the visitor's email app (there is no mail server behind it)
function ContactUsPage () {
  const [sent, setSent] = useState(false)

  const handleSubmit = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const subject = encodeURIComponent(`Message from ${data.get('name')} (We🧡Pets)`)
    const body = encodeURIComponent(`${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          Contact us
        </Typography>
        <Typography variant='body1'>
          Questions about adopting or fostering a pet? Write to us and we will get back to you.
        </Typography>

        {!CONTACT_EMAIL && (
          <Alert severity='warning'>
            The contact email is not set yet (REACT_APP_CONTACT_EMAIL).
          </Alert>
        )}
        {sent && (
          <Alert severity='success'>
            Your email app should be open with the message - press send there.
          </Alert>
        )}

        <Paper component='form' elevation={4} sx={{ p: 3 }} onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField required label='Your name' name='name' />
            <TextField required type='email' label='Your email' name='email' />
            <TextField required multiline minRows={4} label='Message' name='message' />
            <Button type='submit' variant='contained' disabled={!CONTACT_EMAIL}>
              Send
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default ContactUsPage
