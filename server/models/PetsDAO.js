const mongoose = require('mongoose')

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['dog', 'cat'] },
  breed: { type: String, required: false, default: null },
  status: {
    type: String,
    required: true,
    enum: ['adoption', 'foster', 'available'],
    default: 'available'
  },
  // The user that currently adopted / fosters the pet (null when available)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  size: { type: String, required: true, enum: ['xs', 's', 'm', 'l', 'xl'] },
  color: { type: String, required: false, default: null },
  bio: { type: String, required: false, default: 'No bio available' },
  hypoallergenic: { type: Boolean, required: false, default: false },
  dietaryRestrictions: { type: String, required: false, default: null },
  image: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  deleted: { type: Boolean, default: false }
})

const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema)

const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Turns "a,b" into { $in: ['a', 'b'] } and "a" into 'a'
const toMatch = value => {
  const list = String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  if (list.length === 0) return undefined
  return list.length === 1 ? list[0] : { $in: list }
}

// Builds a safe Mongo filter out of the (untrusted) query string.
// Only whitelisted fields are used, so nobody can inject operators like $where.
function buildFilter (criteria = {}) {
  const filter = { deleted: { $ne: true } }

  for (const field of ['type', 'status', 'size']) {
    if (typeof criteria[field] === 'string') {
      const match = toMatch(criteria[field])
      if (match !== undefined) filter[field] = match
    }
  }

  for (const field of ['name', 'breed', 'color']) {
    if (typeof criteria[field] === 'string' && criteria[field].trim() !== '') {
      filter[field] = new RegExp(escapeRegex(criteria[field].trim()), 'i')
    }
  }

  if (criteria.hypoallergenic === 'true' || criteria.hypoallergenic === 'false') {
    filter.hypoallergenic = criteria.hypoallergenic === 'true'
  }

  return filter
}

module.exports = class PetsDAO {
  //
  static buildFilter (criteria) {
    return buildFilter(criteria)
  }

  static async createPet (newPetObject) {
    const pet = new Pet(newPetObject)
    await pet.save()
    return pet._id
  }

  static async getPetsByCriteria (criteria) {
    return await Pet.find(buildFilter(criteria)).sort({ createdAt: -1 })
  }

  static async getAll () {
    return await Pet.find({ deleted: { $ne: true } })
  }

  static async getPetByID (id) {
    try {
      const pet = await Pet.findOne({ _id: id, deleted: { $ne: true } })
      return pet
    } catch (err) {
      return
    }
  }

  static async getPetsByIDs (petIds) {
    return await Pet.find({ _id: { $in: petIds }, deleted: { $ne: true } })
  }

  static async getPetsByOwner (ownerID) {
    return await Pet.find({ owner: ownerID, deleted: { $ne: true } })
  }

  static async updatePet (id, updateFields) {
    const result = await Pet.updateOne({ _id: id }, { $set: updateFields })
    return result
  }

  static async deletePet (id) {
    const result = await Pet.deleteOne({ _id: id })
    return result
  }
}
