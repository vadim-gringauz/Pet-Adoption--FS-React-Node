import axios from '../config/axios'
import request from './request'

class PetAPI {
  // Admin only => { success, newPetID }
  static async createPet (newPetData) {
    return request(() => axios.post('/pet/new', newPetData))
  }

  // Admin only
  static async updatePet (petID, updatedPetData) {
    return request(() => axios.patch(`/pet/${petID}`, updatedPetData))
  }

  // Admin only
  static async deletePet (petID) {
    return request(() => axios.delete(`/pet/${petID}`))
  }

  // => { success, pet }
  static async getOnePet (petID) {
    return request(() => axios.get(`/pet/${petID}`))
  }

  // filterBy: { type, size, status, name, breed, color, hypoallergenic }
  // => { success, pets }
  static async searchPets (filterBy = {}) {
    const params = {}
    Object.entries(filterBy).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value
      }
    })
    return request(() => axios.get('/pet/', { params }))
  }

  static async getAllPets () {
    return PetAPI.searchPets()
  }

  static async addPetToWishList (petID) {
    return request(() => axios.post(`/pet/${petID}/save`))
  }

  static async removePetFromWishList (petID) {
    return request(() => axios.delete(`/pet/${petID}/save`))
  }

  // => { success, saved: [pets in the wish list], owned: [adopted / fostered pets] }
  static async getPetsOfUser (userID) {
    return request(() => axios.get(`/pet/user/${userID}`))
  }

  static async reservePetForAdoption (petID) {
    return request(() => axios.post(`/pet/${petID}/adopt`))
  }

  static async reservePetForFoster (petID) {
    return request(() => axios.post(`/pet/${petID}/foster`))
  }

  // Return a pet that the user adopted / fosters
  static async clearReservedStatus (petID, status = 'adoption') {
    const action = status === 'foster' ? 'foster' : 'adopt'
    return request(() => axios.delete(`/pet/${petID}/${action}`))
  }
}

export default PetAPI
