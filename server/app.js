require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { initDB } = require('./models/init')
const port = process.env.PORT || 3005

// Allowed client origins (comma separated). Defaults: the deployed app + local dev
const allowedOrigins = (
  process.env.CLIENT_ORIGINS || 'https://wepets.onrender.com,http://localhost:3000'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true }))

const userRoute = require('./routes/userRouter')
const petRoute = require('./routes/petRouter')
const adminRoute = require('./routes/adminRouter')

app.use('/user', userRoute)
app.use('/pet', petRoute)
app.use('/admin', adminRoute)

// Unknown endpoint
app.use((req, res) => {
  res.status(404).json({ success: false, message: '❌ Endpoint not found' })
})

// Malformed JSON bodies and any other error that was not handled
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: '❌ Invalid JSON' })
  }
  console.error(err)
  res.status(500).json({ success: false, message: '❌ Unknown error' })
})

// Only connect to the DB and listen when started directly ("node app"),
// so the app can be imported by the tests
if (require.main === module) {
  initDB()
  app.listen(port, () => {
    console.log(`🟢 Server is running on port ${port}`)
  })
}

module.exports = app
