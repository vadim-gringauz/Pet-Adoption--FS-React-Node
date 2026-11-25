import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import PetAPI from '../API/PetAPI'
import Notice from '../components/Notice'
import { PET_SIZES, PET_STATUSES, PET_TYPES } from '../config/petOptions'

const EMPTY_PET = {
  name: '',
  type: 'dog',
  size: 'm',
  status: 'available',
  breed: '',
  color: '',
  bio: '',
  dietaryRestrictions: '',
  image: '',
  hypoallergenic: false
}

const TEXT_FIELDS = ['name', 'breed', 'color', 'bio', 'dietaryRestrictions', 'image']

// Admin only: add a new pet, or edit an existing one (/dashboard/pets/:id/edit)
function AddPetPage () {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [pet, setPet] = useState(EMPTY_PET)
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ open: false })

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    PetAPI.getOnePet(id).then(result => {
      if (cancelled) return
      if (result.success) {
        // empty fields come as null from the server
        const loaded = { ...EMPTY_PET }
        Object.keys(EMPTY_PET).forEach(key => {
          if (result.pet[key] !== null && result.pet[key] !== undefined) {
            loaded[key] = result.pet[key]
          }
        })
        setPet(loaded)
      } else {
        setLoadError(result.message)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  const handleChange = event => {
    const { name, value } = event.target
    setPet(current => ({ ...current, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()

    const body = {
      type: pet.type,
      size: pet.size,
      hypoallergenic: pet.hypoallergenic
    }
    TEXT_FIELDS.forEach(field => {
      body[field] = pet[field].trim()
    })
    if (!body.name) {
      return setNotice({ open: true, severity: 'error', message: 'The pet needs a name' })
    }
    if (isEdit) body.status = pet.status

    // the server accepts only non-empty optional text fields when creating
    if (!isEdit) {
      TEXT_FIELDS.forEach(field => {
        if (field !== 'name' && body[field] === '') delete body[field]
      })
    }

    setSaving(true)
    const result = isEdit
      ? await PetAPI.updatePet(id, body)
      : await PetAPI.createPet(body)
    setSaving(false)

    if (!result.success) {
      return setNotice({ open: true, severity: 'error', message: result.message })
    }
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <Stack alignItems='center' my={10}>
        <CircularProgress color='warning' />
      </Stack>
    )
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant='h3' component='h1'>
          {isEdit ? 'Edit pet' : 'Add a pet'}
        </Typography>

        {loadError && <Alert severity='error'>{loadError}</Alert>}

        {!loadError && (
          <Paper component='form' elevation={4} sx={{ p: 3 }} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label='Name'
                  name='name'
                  value={pet.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Breed'
                  name='breed'
                  value={pet.breed}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='pet-type-label'>Type</InputLabel>
                  <Select
                    labelId='pet-type-label'
                    label='Type'
                    name='type'
                    value={pet.type}
                    onChange={handleChange}
                  >
                    {PET_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='pet-size-label'>Size</InputLabel>
                  <Select
                    labelId='pet-size-label'
                    label='Size'
                    name='size'
                    value={pet.size}
                    onChange={handleChange}
                  >
                    {PET_SIZES.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label='Color'
                  name='color'
                  value={pet.color}
                  onChange={handleChange}
                />
              </Grid>

              {isEdit && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id='pet-status-label'>Status</InputLabel>
                    <Select
                      labelId='pet-status-label'
                      label='Status'
                      name='status'
                      value={pet.status}
                      onChange={handleChange}
                    >
                      {PET_STATUSES.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={isEdit ? 6 : 12}>
                <FormControlLabel
                  label='Hypoallergenic'
                  control={
                    <Checkbox
                      checked={pet.hypoallergenic}
                      onChange={event =>
                        setPet(current => ({
                          ...current,
                          hypoallergenic: event.target.checked
                        }))
                      }
                    />
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Dietary restrictions'
                  name='dietaryRestrictions'
                  value={pet.dietaryRestrictions}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Image URL'
                  name='image'
                  value={pet.image}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label='Bio'
                  name='bio'
                  value={pet.bio}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction='row' spacing={2}>
                  <Button type='submit' variant='contained' disabled={saving}>
                    {isEdit ? 'Save changes' : 'Add pet'}
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>Cancel</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Stack>
      <Notice notice={notice} setNotice={setNotice} />
    </Container>
  )
}

export default AddPetPage
