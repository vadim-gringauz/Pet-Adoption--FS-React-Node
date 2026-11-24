import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container, Stack, Typography } from '@mui/material'
import FilterPets, { EMPTY_FILTERS } from '../components/FilterPets'
import PetsGrid from '../components/pets/PetsGrid'
import usePets from '../hooks/usePets'

const FILTER_NAMES = Object.keys(EMPTY_FILTERS)

// The search lives in the URL (/search?type=dog&size=s), so results can be
// bookmarked / shared, and the "Quick search" of the home page can link here
function SearchPage () {
  const [searchParams, setSearchParams] = useSearchParams()

  const appliedFilters = {}
  FILTER_NAMES.forEach(name => {
    const value = searchParams.get(name)
    if (value) appliedFilters[name] = value
  })

  // what is typed in the form, before pressing "Search"
  const [formFilters, setFormFilters] = useState({
    ...EMPTY_FILTERS,
    ...appliedFilters
  })

  // keep the form in sync when the URL changes (browser back / forward, quick search)
  const paramsKey = searchParams.toString()
  useEffect(() => {
    setFormFilters({ ...EMPTY_FILTERS, ...Object.fromEntries(new URLSearchParams(paramsKey)) })
  }, [paramsKey])

  const { pets, loading, error, updatePet } = usePets(appliedFilters)

  const handleSearch = () => {
    const params = {}
    FILTER_NAMES.forEach(name => {
      if (formFilters[name]) params[name] = formFilters[name].trim()
    })
    setSearchParams(params)
  }

  const handleReset = () => {
    setFormFilters(EMPTY_FILTERS)
    setSearchParams({})
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          Search pets
        </Typography>
        <FilterPets
          filters={formFilters}
          onChange={setFormFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />
        <PetsGrid
          pets={pets}
          loading={loading}
          error={error}
          onPetChange={updatePet}
          emptyMessage='No pets match your search'
        />
      </Stack>
    </Container>
  )
}

export default SearchPage
