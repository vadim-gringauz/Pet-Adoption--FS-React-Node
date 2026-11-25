import { useState, useEffect } from 'react'
import PetAPI from '../API/PetAPI'
import useAuth from './useAuth'

// The pets of the signed user:
//  saved = the pets in his wish list, owned = the pets he adopted / fosters
export default function useUserPets () {
  const { auth } = useAuth()
  const userID = auth.signedUser?._id

  const [saved, setSaved] = useState([])
  const [owned, setOwned] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userID) return
    let cancelled = false
    setLoading(true)
    setError(null)

    PetAPI.getPetsOfUser(userID).then(result => {
      if (cancelled) return
      if (result.success) {
        setSaved(result.saved)
        setOwned(result.owned)
      } else {
        setError(result.message)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [userID])

  return { saved, owned, setSaved, setOwned, loading, error }
}
