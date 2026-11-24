import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Container, Stack, Tab, Tabs, Typography } from '@mui/material'
import PetsGrid from '../components/pets/PetsGrid'
import usePets from '../hooks/usePets'

// "Our pets": all the pets, with tabs to show only dogs or only cats
function PetPage () {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = ['dog', 'cat'].includes(searchParams.get('type'))
    ? searchParams.get('type')
    : ''

  const { pets, loading, error, updatePet } = usePets(type ? { type } : {})

  const handleTabChange = (event, newType) => {
    setSearchParams(newType ? { type: newType } : {})
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Typography variant='h3' component='h1'>
            Our pets
          </Typography>
          <Button variant='outlined' onClick={() => navigate('/search')}>
            Advanced search
          </Button>
        </Stack>

        <Tabs value={type} onChange={handleTabChange}>
          <Tab label='All' value='' />
          <Tab label='Dogs' value='dog' />
          <Tab label='Cats' value='cat' />
        </Tabs>

        <PetsGrid
          pets={pets}
          loading={loading}
          error={error}
          onPetChange={updatePet}
          emptyMessage='No pets here yet'
        />
      </Stack>
    </Container>
  )
}

export default PetPage
