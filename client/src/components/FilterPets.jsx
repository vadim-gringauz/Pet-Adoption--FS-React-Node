import React from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField
} from '@mui/material'
import { PET_SIZES, PET_STATUSES, PET_TYPES } from '../config/petOptions'

export const EMPTY_FILTERS = {
  name: '',
  type: '',
  size: '',
  status: '',
  hypoallergenic: ''
}

function SelectField ({ label, name, value, options, onChange }) {
  const labelId = `filter-${name}-label`
  return (
    <FormControl size='small' fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        name={name}
        value={value}
        onChange={onChange}
      >
        <MenuItem value=''>Any</MenuItem>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

// The search form: filters = { name, type, size, status, hypoallergenic }
function FilterPets ({ filters, onChange, onSearch, onReset }) {
  const handleChange = event => {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  const handleSubmit = event => {
    event.preventDefault()
    onSearch()
  }

  return (
    <Paper component='form' elevation={4} sx={{ p: 2 }} onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} md={4}>
          <TextField
            size='small'
            fullWidth
            label='Name'
            name='name'
            value={filters.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <SelectField
            label='Type'
            name='type'
            value={filters.type}
            options={PET_TYPES}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <SelectField
            label='Size'
            name='size'
            value={filters.size}
            options={PET_SIZES}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <SelectField
            label='Status'
            name='status'
            value={filters.status}
            options={PET_STATUSES}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControlLabel
            label='Hypoallergenic only'
            control={
              <Checkbox
                checked={filters.hypoallergenic === 'true'}
                onChange={event =>
                  onChange({
                    ...filters,
                    hypoallergenic: event.target.checked ? 'true' : ''
                  })
                }
              />
            }
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <Button type='submit' variant='contained' fullWidth>
            Search
          </Button>
        </Grid>
        <Grid item xs={6} md={4}>
          <Button type='button' variant='outlined' fullWidth onClick={onReset}>
            Clear
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default FilterPets
