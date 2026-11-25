import React from 'react'
import { Container, Stack, Typography } from '@mui/material'
import PetsGrid from '../components/pets/PetsGrid'
import useUserPets from '../hooks/useUserPets'

// The pets that the signed user adopted or fosters
function MyPetsPage () {
  const { owned, setOwned, loading, error } = useUserPets()

  const handlePetChange = updatedPet => {
    setOwned(current =>
      updatedPet.status === 'available'
        ? current.filter(pet => pet._id !== updatedPet._id) // returned
        : current.map(pet => (pet._id === updatedPet._id ? updatedPet : pet))
    )
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          My pets
        </Typography>
        <PetsGrid
          pets={owned}
          loading={loading}
          error={error}
          onPetChange={handlePetChange}
          emptyMessage="You don't have a pet yet - go and meet the pets that wait for you!"
        />
      </Stack>
    </Container>
  )
}

export default MyPetsPage
