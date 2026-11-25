const mongoose = require('mongoose')

module.exports.initDB = async function initDB () {
  const db = mongoose.connection
  db.on('error', error => console.error(error))
  db.once('open', () => console.log('✅ Connected to DB'))

  try {
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (error) {
    console.error('❌ Could not connect to DB:', error.message)
  }
}
