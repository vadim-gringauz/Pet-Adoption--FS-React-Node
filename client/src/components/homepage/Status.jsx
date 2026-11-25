import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'
import useUserPets from '../../hooks/useUserPets'

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

// The signed user's pets: how many he adopted, fosters and saved
function Status () {
  const navigate = useNavigate()
  const { saved, owned, loading } = useUserPets()

  const adopted = owned.filter(pet => pet.status === 'adoption').length
  const fostered = owned.filter(pet => pet.status === 'foster').length

  return (
    <Stack spacing={2} alignItems='flex-start'>
      {!loading && (
        <Typography variant='body1'>
          You adopted {plural(adopted, 'pet')}, foster {plural(fostered, 'pet')} and
          saved {plural(saved.length, 'pet')} to your wish list.
        </Typography>
      )}
      <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
        <Button variant='contained' onClick={() => navigate('/pets')}>
          View our pets
        </Button>
        <Button variant='outlined' onClick={() => navigate('/my-pets')}>
          My pets
        </Button>
        <Button variant='outlined' onClick={() => navigate('/wish-list')}>
          My wish list
        </Button>
      </Stack>
    </Stack>
  )
}

export default Status
