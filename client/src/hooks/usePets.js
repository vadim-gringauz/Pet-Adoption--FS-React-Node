import { useState, useEffect, useCallback } from 'react'
import PetAPI from '../API/PetAPI'

// Loads the pets that match the filters (re-loads when the filters change)
// => { pets, loading, error, updatePet }
// updatePet(pet) replaces a pet in the list (e.g. after it was adopted)
export default function usePets (filters = {}) {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    PetAPI.searchPets(JSON.parse(filtersKey)).then(result => {
      if (cancelled) return
      if (result.success) setPets(result.pets)
      else setError(result.message)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [filtersKey])

  const updatePet = useCallback(updatedPet => {
    setPets(current =>
      current.map(pet => (pet._id === updatedPet._id ? updatedPet : pet))
    )
  }, [])

  return { pets, loading, error, updatePet }
}
