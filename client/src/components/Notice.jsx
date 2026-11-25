import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

// A small message at the bottom of the screen.
// Use with: const [notice, setNotice] = useState({ open: false })
//   setNotice({ open: true, severity: 'success', message: 'Saved!' })
//   <Notice notice={notice} setNotice={setNotice} />
function Notice ({ notice, setNotice }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    setNotice(current => ({ ...current, open: false }))
  }

  return (
    <Snackbar
      open={Boolean(notice.open)}
      autoHideDuration={5000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={notice.severity || 'info'}
        sx={{ width: '100%' }}
      >
        {notice.message}
      </Alert>
    </Snackbar>
  )
}

export default Notice
