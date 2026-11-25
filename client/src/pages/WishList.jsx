import React from 'react'
import { Container, Stack, Typography } from '@mui/material'
import PetsGrid from '../components/pets/PetsGrid'
import useUserPets from '../hooks/useUserPets'

// The pets that the signed user saved
function WishList () {
  const { saved, setSaved, loading, error } = useUserPets()

  const handleSavedChange = (pet, isSaved) => {
    // un-saved pets disappear from the wish list
    if (!isSaved) setSaved(current => current.filter(p => p._id !== pet._id))
  }

  const handlePetChange = updatedPet => {
    setSaved(current =>
      current.map(pet => (pet._id === updatedPet._id ? updatedPet : pet))
    )
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          My wish list
        </Typography>
        <PetsGrid
          pets={saved}
          loading={loading}
          error={error}
          onPetChange={handlePetChange}
          onSavedChange={handleSavedChange}
          emptyMessage='Your wish list is empty - press "Save" on a pet you like'
        />
      </Stack>
    </Container>
  )
}

export default WishList
