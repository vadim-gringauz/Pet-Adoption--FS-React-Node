import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  FormLabel,
  Grid,
} from '@mui/material'
import { PET_SIZES, PET_TYPES } from '../config/petOptions'

function QuickSearch() {

  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [size, setSize] = useState('')

  // opens the search page with the chosen filters: /search?type=dog&size=s
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (size) params.set('size', size)
    const query = params.toString()
    navigate(query ? `/search?${query}` : '/search')
  }

  return (
    <Paper
      elevation={20}
      sx={{
        maxWidth: '900px',
        borderRadius: '20px',
        padding: '15px 25px',
        backgroundColor: 'rgba(0,0,0,.2)'
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <FormLabel sx={{ color: 'white', fontSize: '2rem' }} >
            What are you looking for?
          </FormLabel>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl size='small' sx={{ width: '100%' }}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-select"
              value={type}
              label="Type"
              onChange={event => setType(event.target.value)}
              sx={{
                backgroundColor: 'white',
              }}
            >
              <MenuItem value={''}>Any</MenuItem>
              {PET_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
        <FormControl size='small' sx={{ width: '100%' }}>
            <InputLabel id="size-label">Size</InputLabel>
            <Select
              labelId="size-label"
              id="size-select"
              value={size}
              label="Size"
              onChange={event => setSize(event.target.value)}
              sx={{
                backgroundColor: 'white',
              }}
            >
              <MenuItem value={''}>Any</MenuItem>
              {PET_SIZES.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant='contained'
            size='small'
            sx={{ width: '100%' }}
            onClick={handleSearch}
          >
            Search Pets
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default QuickSearch