import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Button, Stack } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PetAPI from '../../API/PetAPI'
import useAuth from '../../hooks/useAuth'
import { updateSignedUser } from '../../features/auth/authSlice'
import Notice from '../Notice'

// The buttons of a pet: save to the wish list, adopt, foster, return.
//  - onPetChange(updatedPet): the pet changed (adopted, fostered, returned)
//  - onSavedChange(pet, isSaved): the pet was saved / removed from the wish list
function PetActions ({ pet, onPetChange, onSavedChange, size = 'small' }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { auth } = useAuth()
  const { isSignedIn, signedUser } = auth

  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ open: false })

  if (!isSignedIn) {
    return (
      <Button size={size} variant='outlined' onClick={() => navigate('/signin')}>
        Sign in to adopt or foster
      </Button>
    )
  }

  const wishList = signedUser?.petsWishList || []
  const isSaved = wishList.includes(pet._id)
  const isMine = pet.owner != null && String(pet.owner) === String(signedUser?._id)

  const showError = message =>
    setNotice({ open: true, severity: 'error', message })

  // Runs a server call, then updates the pet with what the server changed
  const changePet = async (apiCall, successMessage) => {
    setBusy(true)
    const result = await apiCall()
    setBusy(false)

    if (!result.success) return showError(result.message)

    onPetChange && onPetChange({ ...pet, ...result.updatedFields })
    setNotice({ open: true, severity: 'success', message: successMessage })
  }

  const handleAdopt = () =>
    changePet(
      () => PetAPI.reservePetForAdoption(pet._id),
      `${pet.name} is yours - thank you for adopting!`
    )

  const handleFoster = () =>
    changePet(
      () => PetAPI.reservePetForFoster(pet._id),
      `You are now fostering ${pet.name}`
    )

  const handleReturn = () =>
    changePet(
      () => PetAPI.clearReservedStatus(pet._id, pet.status),
      `${pet.name} was returned and is available again`
    )

  const handleToggleSave = async () => {
    setBusy(true)
    const result = isSaved
      ? await PetAPI.removePetFromWishList(pet._id)
      : await PetAPI.addPetToWishList(pet._id)
    setBusy(false)

    if (!result.success) return showError(result.message)

    const newWishList = isSaved
      ? wishList.filter(id => id !== pet._id)
      : [...wishList, pet._id]
    dispatch(updateSignedUser({ petsWishList: newWishList }))
    onSavedChange && onSavedChange(pet, !isSaved)
  }

  return (
    <>
      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        <Button
          size={size}
          disabled={busy}
          color='secondary'
          startIcon={isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={handleToggleSave}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        {(pet.status === 'available' || (pet.status === 'foster' && isMine)) && (
          <Button size={size} disabled={busy} variant='contained' onClick={handleAdopt}>
            Adopt
          </Button>
        )}
        {pet.status === 'available' && (
          <Button size={size} disabled={busy} variant='outlined' onClick={handleFoster}>
            Foster
          </Button>
        )}
        {pet.status !== 'available' && isMine && (
          <Button
            size={size}
            disabled={busy}
            variant='outlined'
            color='warning'
            onClick={handleReturn}
          >
            Return pet
          </Button>
        )}
      </Stack>
      <Notice notice={notice} setNotice={setNotice} />
    </>
  )
}

export default PetActions
