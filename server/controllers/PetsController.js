const PetsDAO = require('../models/PetsDAO')
const logger = require('../utils/logger')
const {
  newPetValidation,
  updatePetValidation
} = require('../validations/petsValidations')

const unknownError = res =>
  res.status(500).json({
    success: false,
    message: '❌ Unknown error'
  })

const isOwner = (pet, user) =>
  pet.owner != null && String(pet.owner) === String(user._id)

module.exports = class PetsController {
  //
  static async createPet (req, res) {
    try {
      const validRequest = newPetValidation(req.body)
      if (!validRequest)
        return res.status(400).json({
          success: false,
          message: '❌ Please fill all required fields (name, type, size)'
        })

      const newPetObject = {
        name: req.body.name,
        type: req.body.type,
        breed: req.body.breed ?? null,
        status: req.body.status ?? 'available',
        size: req.body.size,
        color: req.body.color ?? null,
        bio: req.body.bio ?? undefined,
        hypoallergenic: req.body.hypoallergenic ?? false,
        dietaryRestrictions: req.body.dietaryRestrictions ?? null,
        image: req.body.image ?? undefined,
        deleted: false
      }

      const newPetID = await PetsDAO.createPet(newPetObject)
      return res.status(201).json({
        success: true,
        message: '✅ New pet created successfully',
        newPetID: newPetID
      })
    } catch (err) {
      logger('PetsController.createPet', err.message)
      return unknownError(res)
    }
  }

  static async getPetByID (req, res, next) {
    let result
    try {
      result = await PetsDAO.getPetByID(req.params.id)
      if (!result) {
        logger('PetsController.getPetByID', 'pet not found')
        return res.status(404).json({
          success: false,
          message: '❌ Can not find pet'
        })
      }
    } catch (err) {
      logger('PetsController.getPetByID', err.message)
      return unknownError(res)
    }
    req.pet = result
    next()
  }

  static getOnePet (req, res) {
    return res.status(200).json({ pet: req.pet })
  }

  static async getPets (req, res) {
    try {
      const result = await PetsDAO.getPetsByCriteria(req.query)
      return res.status(200).json({ pets: result })
    } catch (err) {
      logger('PetsController.getPets', err.message)
      return unknownError(res)
    }
  }

  // The pets the user saved (wish list) and the pets the user adopted / fosters.
  // Expects UsersController.getUserByID to have set req.user
  static async getPetsOfUser (req, res) {
    try {
      const { user } = req
      const saved = await PetsDAO.getPetsByIDs(user.petsWishList)
      const owned = await PetsDAO.getPetsByOwner(user._id)
      return res.status(200).json({ saved, owned })
    } catch (err) {
      logger('PetsController.getPetsOfUser', err.message)
      return unknownError(res)
    }
  }

  static async adopt (req, res) {
    const { currentUser, pet } = req

    try {
      // Available pets can be adopted, and a pet can be adopted by the one fostering it
      const canAdopt =
        pet.status === 'available' ||
        (pet.status === 'foster' && isOwner(pet, currentUser))
      if (!canAdopt) {
        return res.status(409).json({
          success: false,
          message: '❌ This pet is not available for adoption'
        })
      }

      await PetsDAO.updatePet(pet._id, {
        status: 'adoption',
        owner: currentUser._id
      })
      return res.status(200).json({
        success: true,
        updatedPet: pet._id,
        updatedFields: {
          status: 'adoption',
          owner: currentUser._id
        }
      })
    } catch (err) {
      logger('PetsController.adopt', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async foster (req, res) {
    const { currentUser, pet } = req

    try {
      if (pet.status !== 'available') {
        return res.status(409).json({
          success: false,
          message: '❌ This pet is not available for fostering'
        })
      }

      await PetsDAO.updatePet(pet._id, {
        status: 'foster',
        owner: currentUser._id
      })
      return res.status(200).json({
        success: true,
        updatedPet: pet._id,
        updatedFields: {
          status: 'foster',
          owner: currentUser._id
        }
      })
    } catch (err) {
      logger('PetsController.foster', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  // Return the pet: only the user that adopted / fosters it can do that
  static async clearStatus (req, res) {
    const { currentUser, pet } = req

    try {
      if (pet.status === 'available' || !isOwner(pet, currentUser)) {
        return res.status(403).json({
          success: false,
          message: '❌ You can only return a pet that you adopted or fostered'
        })
      }

      await PetsDAO.updatePet(pet._id, { status: 'available', owner: null })
      return res.status(200).json({
        success: true,
        updatedPet: pet._id,
        updatedFields: {
          status: 'available',
          owner: null
        }
      })
    } catch (err) {
      logger('PetsController.clearStatus', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async updatePet (req, res) {
    try {
      const validRequest = updatePetValidation(req.body)
      if (!validRequest)
        return res.status(400).json({
          success: false,
          message: '❌ Fields or values not valid'
        })

      const updateFields = { ...req.body }
      // An admin that marks a pet as available also frees it from its owner
      if (updateFields.status === 'available') updateFields.owner = null

      await PetsDAO.updatePet(req.pet._id, updateFields)
      return res.status(200).json({
        success: true,
        updatedFields: updateFields
      })
    } catch (err) {
      logger('PetsController.updatePet', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }

  static async markAsDeleted (req, res) {
    const { pet } = req
    try {
      await PetsDAO.updatePet(pet._id, { deleted: true })
      return res.status(200).json({
        success: true,
        updatedPet: pet._id,
        updatedFields: {
          deleted: true
        }
      })
    } catch (err) {
      logger('PetsController.markAsDeleted', err.message)
      return res.status(500).json({
        success: false,
        message: `❌ ${err.message}`
      })
    }
  }
}
