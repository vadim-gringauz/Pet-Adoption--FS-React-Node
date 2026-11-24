import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from '@mui/material'
import PetAPI from '../API/PetAPI'
import UserAPI from '../API/UserAPI'
import useAuth from '../hooks/useAuth'
import Notice from '../components/Notice'
import { PET_SIZES, PET_STATUSES, PET_TYPES, labelOf } from '../config/petOptions'

const fullName = user =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') || '-'

// Admin dashboard: manage the pets and the users
function Dashboard () {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const myID = auth.signedUser?._id

  const [tab, setTab] = useState('pets')
  const [pets, setPets] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState({ open: false })

  useEffect(() => {
    let cancelled = false
    Promise.all([PetAPI.searchPets(), UserAPI.getAllUsers()]).then(
      ([petsResult, usersResult]) => {
        if (cancelled) return
        if (!petsResult.success) setError(petsResult.message)
        else if (!usersResult.success) setError(usersResult.message)
        else {
          setPets(petsResult.pets)
          setUsers(usersResult.users)
        }
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const showResult = (result, successMessage) => {
    setNotice({
      open: true,
      severity: result.success ? 'success' : 'error',
      message: result.success ? successMessage : result.message
    })
    return result.success
  }

  const ownerOf = pet => {
    if (!pet.owner) return '-'
    const owner = users.find(user => user._id === pet.owner)
    return owner ? owner.email : pet.owner
  }

  const handleDeletePet = async pet => {
    if (!window.confirm(`Delete ${pet.name}?`)) return
    const result = await PetAPI.deletePet(pet._id)
    if (showResult(result, `${pet.name} was deleted`)) {
      setPets(current => current.filter(p => p._id !== pet._id))
    }
  }

  const handleToggleAdmin = async user => {
    const makeAdmin = user.permission !== 'admin'
    const result = makeAdmin
      ? await UserAPI.makeUserAdmin(user._id)
      : await UserAPI.removeAdmin(user._id)
    if (showResult(result, makeAdmin ? `${user.email} is now an admin` : `${user.email} is not an admin anymore`)) {
      setUsers(current =>
        current.map(u =>
          u._id === user._id ? { ...u, permission: makeAdmin ? 'admin' : 'user' } : u
        )
      )
    }
  }

  const handleDeleteUser = async user => {
    if (!window.confirm(`Delete the user ${user.email}?`)) return
    const result = await UserAPI.deleteUser(user._id)
    if (showResult(result, `${user.email} was deleted`)) {
      setUsers(current => current.filter(u => u._id !== user._id))
    }
  }

  if (loading) {
    return (
      <Stack alignItems='center' my={10}>
        <CircularProgress color='warning' />
      </Stack>
    )
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
            Dashboard
          </Typography>
          <Button variant='contained' onClick={() => navigate('/dashboard/pets/new')}>
            Add a pet
          </Button>
        </Stack>

        {error && <Alert severity='error'>{error}</Alert>}

        <Tabs value={tab} onChange={(event, value) => setTab(value)}>
          <Tab value='pets' label={`Pets (${pets.length})`} />
          <Tab value='users' label={`Users (${users.length})`} />
        </Tabs>

        {tab === 'pets' && (
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Adopted / fostered by</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pets.map(pet => (
                  <TableRow key={pet._id} hover>
                    <TableCell>{pet.name}</TableCell>
                    <TableCell>{labelOf(PET_TYPES, pet.type)}</TableCell>
                    <TableCell>{labelOf(PET_SIZES, pet.size)}</TableCell>
                    <TableCell>{labelOf(PET_STATUSES, pet.status)}</TableCell>
                    <TableCell>{ownerOf(pet)}</TableCell>
                    <TableCell align='right'>
                      <Button size='small' onClick={() => navigate(`/pets/${pet._id}`)}>
                        View
                      </Button>
                      <Button
                        size='small'
                        onClick={() => navigate(`/dashboard/pets/${pet._id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button size='small' color='error' onClick={() => handleDeletePet(pet)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      No pets yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 'users' && (
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id} hover>
                    <TableCell>{fullName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={user.permission}
                        color={user.permission === 'admin' ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        size='small'
                        disabled={user._id === myID}
                        onClick={() => handleToggleAdmin(user)}
                      >
                        {user.permission === 'admin' ? 'Remove admin' : 'Make admin'}
                      </Button>
                      <Button
                        size='small'
                        color='error'
                        disabled={user._id === myID}
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
      <Notice notice={notice} setNotice={setNotice} />
    </Container>
  )
}

export default Dashboard
