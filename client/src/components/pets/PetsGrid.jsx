import React from 'react'
import { Alert, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import PetCard from './PetCard'

// A responsive grid of pets, with loading / error / empty states
function PetsGrid ({
  pets,
  loading,
  error,
  onPetChange,
  onSavedChange,
  emptyMessage = 'No pets found'
}) {
  if (loading) {
    return (
      <Stack alignItems='center' my={5}>
        <CircularProgress color='warning' />
      </Stack>
    )
  }

  if (error) return <Alert severity='error'>{error}</Alert>

  if (pets.length === 0) {
    return (
      <Typography variant='h6' color='text.secondary' textAlign='center' my={5}>
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <Grid container spacing={3}>
      {pets.map(pet => (
        <Grid item xs={12} sm={6} lg={4} key={pet._id}>
          <PetCard
            pet={pet}
            onPetChange={onPetChange}
            onSavedChange={onSavedChange}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default PetsGrid
