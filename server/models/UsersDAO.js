const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: false, default: null },
  lastName: { type: String, required: false, default: null },
  avatar: { type: String, required: false, default: null },
  phone: { type: String, required: false, default: null },
  createdAt: { type: Date, required: true, default: Date.now },
  permission: { type: String, enum: ['user', 'admin'], default: 'user' },
  petsWishList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
  settings: {
    darkMode: { type: Boolean, required: true, default: false }
  }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

module.exports = class UsersDAO {
  //
  static async createUser (newUserObject) {
    const user = new User(newUserObject)
    await user.save()
    return user._id
  }

  // None of the "get" functions below return the password hash,
  // except getUserByEmail which is only used for signing in.
  static async getAll () {
    return await User.find().select('-password')
  }

  static async getAdmins () {
    return await User.find({ permission: 'admin' }).select('-password')
  }

  static async getUserByEmail (email) {
    return await User.findOne({ email })
  }

  static async getUserByID (id) {
    try {
      const user = await User.findById(id).select('-password')
      return user
    } catch (err) {
      return
    }
  }

  static async deleteUser (id) {
    const result = await User.deleteOne({ _id: id })
    return result
  }

  static async updateUser (id, updateFields) {
    const result = await User.updateOne({ _id: id }, { $set: updateFields })
    return result
  }

  static async setPermission (id, permission) {
    return await User.updateOne({ _id: id }, { $set: { permission } })
  }

  static async addPetToWishList (userID, petID) {
    const result = await User.updateOne(
      { _id: userID },
      { $addToSet: { petsWishList: petID } }
    )
    return result
  }

  static async removePetFromWishList (userID, petID) {
    const result = await User.updateOne(
      { _id: userID },
      { $pull: { petsWishList: petID } }
    )
    return result
  }
}
