import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import PetsIcon from '@mui/icons-material/Pets'
import PetActions from './PetActions'
import { PET_SIZES, PET_STATUSES, PET_TYPES, labelOf } from '../../config/petOptions'

const STATUS_COLORS = { available: 'success', foster: 'warning', adoption: 'default' }

export function PetImage ({ pet, height = 240 }) {
  if (pet.image) {
    return (
      <CardMedia
        component='img'
        height={height}
        image={pet.image}
        alt={pet.name}
        sx={{ objectFit: 'cover' }}
      />
    )
  }
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'action.hover'
      }}
    >
      <PetsIcon sx={{ fontSize: height / 2, opacity: 0.3 }} />
    </Box>
  )
}

function PetCard ({ pet, onPetChange, onSavedChange }) {
  const navigate = useNavigate()

  return (
    <Card raised sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PetImage pet={pet} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5' component='h2'>
            {pet.name}
          </Typography>
          <Chip
            size='small'
            label={labelOf(PET_STATUSES, pet.status)}
            color={STATUS_COLORS[pet.status] || 'default'}
          />
        </Stack>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          {labelOf(PET_TYPES, pet.type)}
          {pet.breed ? `, ${pet.breed}` : ''} · {labelOf(PET_SIZES, pet.size)}
        </Typography>
        {pet.bio && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {pet.bio}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ flexWrap: 'wrap', px: 2, pb: 2 }}>
        <Button size='small' onClick={() => navigate(`/pets/${pet._id}`)}>
          Details
        </Button>
        <PetActions
          pet={pet}
          onPetChange={onPetChange}
          onSavedChange={onSavedChange}
        />
      </CardActions>
    </Card>
  )
}

export default PetCard
