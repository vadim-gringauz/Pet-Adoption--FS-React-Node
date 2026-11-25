const express = require('express')
const router = express.Router()

const PetsController = require('../controllers/PetsController')
const UsersController = require('../controllers/UsersController')

const authMiddleware = require('../middlewares/authMiddleware')

//! PUBLIC ROUTES:
router.get('/', PetsController.getPets)

//! PROTECTED TO SIGNED IN USERS:
// The pets a user saved and the pets a user adopted / fosters (own data or admin)
router.get(
  '/user/:id',
  authMiddleware,
  UsersController.isSelfOrAdmin,
  UsersController.getUserByID,
  PetsController.getPetsOfUser
)

//! PUBLIC ROUTES (single pet):
router.get('/:id', PetsController.getPetByID, PetsController.getOnePet)

//! PROTECTED TO SIGNED IN USERS:
router.post(
  '/:id/adopt',
  authMiddleware,
  PetsController.getPetByID,
  PetsController.adopt
)
router.delete(
  '/:id/adopt',
  authMiddleware,
  PetsController.getPetByID,
  PetsController.clearStatus
)
router.post(
  '/:id/foster',
  authMiddleware,
  PetsController.getPetByID,
  PetsController.foster
)
router.delete(
  '/:id/foster',
  authMiddleware,
  PetsController.getPetByID,
  PetsController.clearStatus
)
router.post(
  '/:id/save',
  authMiddleware,
  PetsController.getPetByID,
  UsersController.addPetToWishList
)
router.delete(
  '/:id/save',
  authMiddleware,
  PetsController.getPetByID,
  UsersController.removePetFromWishList
)

//! PROTECTED TO ADMIN:
router.post(
  '/new',
  authMiddleware,
  UsersController.isAdmin,
  PetsController.createPet
)
router.patch(
  '/:id',
  authMiddleware,
  UsersController.isAdmin,
  PetsController.getPetByID,
  PetsController.updatePet
)
router.delete(
  '/:id',
  authMiddleware,
  UsersController.isAdmin,
  PetsController.getPetByID,
  PetsController.markAsDeleted
)

module.exports = router
