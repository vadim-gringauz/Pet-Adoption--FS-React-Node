import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import PetAPI from '../API/PetAPI'
import PetActions from '../components/pets/PetActions'
import { PetImage } from '../components/pets/PetCard'
import { PET_SIZES, PET_STATUSES, PET_TYPES, labelOf } from '../config/petOptions'

function Detail ({ label, value }) {
  return (
    <Stack direction='row' spacing={2}>
      <Typography variant='body1' color='text.secondary' sx={{ minWidth: '10rem' }}>
        {label}
      </Typography>
      <Typography variant='body1'>{value || '-'}</Typography>
    </Stack>
  )
}

function PetDetailsPage () {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    PetAPI.getOnePet(id).then(result => {
      if (cancelled) return
      if (result.success) setPet(result.pet)
      else setError(result.status === 404 ? 'We could not find this pet' : result.message)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <Stack alignItems='center' my={10}>
        <CircularProgress color='warning' />
      </Stack>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack spacing={3} alignItems='flex-start'>
        <Button onClick={() => navigate(-1)}>← Back</Button>

        {error && <Alert severity='error'>{error}</Alert>}

        {pet && (
          <Paper elevation={4} sx={{ width: '100%', overflow: 'hidden' }}>
            <Grid container>
              <Grid item xs={12} md={6}>
                <PetImage pet={pet} height={450} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Typography variant='h3' component='h1'>
                        {pet.name}
                      </Typography>
                      <Chip
                        label={labelOf(PET_STATUSES, pet.status)}
                        color={pet.status === 'available' ? 'success' : 'warning'}
                      />
                    </Stack>

                    <Typography variant='body1'>{pet.bio}</Typography>

                    <Detail label='Type' value={labelOf(PET_TYPES, pet.type)} />
                    <Detail label='Breed' value={pet.breed} />
                    <Detail label='Size' value={labelOf(PET_SIZES, pet.size)} />
                    <Detail label='Color' value={pet.color} />
                    <Detail
                      label='Hypoallergenic'
                      value={pet.hypoallergenic ? 'Yes' : 'No'}
                    />
                    <Detail
                      label='Dietary restrictions'
                      value={pet.dietaryRestrictions}
                    />

                    <Box pt={2}>
                      <PetActions pet={pet} onPetChange={setPet} size='medium' />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}

export default PetDetailsPage
