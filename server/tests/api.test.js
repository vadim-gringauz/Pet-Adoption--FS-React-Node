// Run with: npm test
// The DAOs (database layer) are replaced with in-memory stubs, so no MongoDB is needed.
process.env.ACCESS_TOKEN_SECRET = 'test-secret'

const test = require('node:test')
const assert = require('node:assert/strict')
const sha256 = require('js-sha256')
const jwt = require('jsonwebtoken')

const UsersDAO = require('../models/UsersDAO')
const PetsDAO = require('../models/PetsDAO')
const app = require('../app')

// ---------- in-memory data ----------
let users, pets

const resetData = () => {
  users = {
    u1: {
      _id: 'u1',
      email: 'user@test.com',
      password: sha256('123456'),
      firstName: 'Reg',
      lastName: 'Ular',
      permission: 'user',
      petsWishList: [],
      settings: { darkMode: false }
    },
    u2: {
      _id: 'u2',
      email: 'other@test.com',
      password: sha256('123456'),
      permission: 'user',
      petsWishList: [],
      settings: { darkMode: false }
    },
    a1: {
      _id: 'a1',
      email: 'admin@test.com',
      password: sha256('123456'),
      permission: 'admin',
      petsWishList: [],
      settings: { darkMode: false }
    }
  }
  pets = {
    p1: { _id: 'p1', name: 'Rex', type: 'dog', size: 'm', status: 'available', owner: null },
    p2: { _id: 'p2', name: 'Tom', type: 'cat', size: 's', status: 'adoption', owner: 'u2' },
    p3: { _id: 'p3', name: 'Zoe', type: 'cat', size: 's', status: 'foster', owner: 'u1' }
  }
}

const withoutPassword = user => {
  if (!user) return user
  const { password, ...rest } = user // eslint-disable-line no-unused-vars
  return rest
}

let lastCriteria
UsersDAO.getUserByEmail = async email =>
  Object.values(users).find(u => u.email === email) || null
UsersDAO.getUserByID = async id => withoutPassword(users[id])
UsersDAO.getAll = async () => Object.values(users).map(withoutPassword)
UsersDAO.createUser = async obj => {
  const _id = 'new' + Object.keys(users).length
  users[_id] = { _id, permission: 'user', petsWishList: [], ...obj }
  return _id
}
UsersDAO.updateUser = async (id, fields) => {
  Object.assign(users[id], fields)
  return { modifiedCount: 1 }
}
UsersDAO.setPermission = async (id, permission) => {
  users[id].permission = permission
  return { modifiedCount: 1 }
}
UsersDAO.deleteUser = async id => {
  delete users[id]
  return { deletedCount: 1 }
}
UsersDAO.addPetToWishList = async (userId, petId) => {
  const list = users[userId].petsWishList
  if (list.includes(petId)) return { modifiedCount: 0 }
  list.push(petId)
  return { modifiedCount: 1 }
}
UsersDAO.removePetFromWishList = async (userId, petId) => {
  const list = users[userId].petsWishList
  if (!list.includes(petId)) return { modifiedCount: 0 }
  users[userId].petsWishList = list.filter(id => id !== petId)
  return { modifiedCount: 1 }
}

PetsDAO.getPetByID = async id => pets[id]
PetsDAO.getPetsByCriteria = async criteria => {
  lastCriteria = criteria
  return Object.values(pets)
}
PetsDAO.getPetsByIDs = async ids => ids.map(id => pets[id]).filter(Boolean)
PetsDAO.getPetsByOwner = async ownerId =>
  Object.values(pets).filter(p => p.owner === ownerId)
PetsDAO.updatePet = async (id, fields) => {
  Object.assign(pets[id], fields)
  return { modifiedCount: 1 }
}
PetsDAO.createPet = async obj => {
  const _id = 'newpet' + Object.keys(pets).length
  pets[_id] = { _id, ...obj }
  return _id
}

// ---------- test server ----------
let server, baseURL

test.before(async () => {
  server = app.listen(0)
  await new Promise(resolve => server.once('listening', resolve))
  baseURL = `http://127.0.0.1:${server.address().port}`
})
test.after(() => server.close())
test.beforeEach(resetData)

const tokenOf = id =>
  jwt.sign({ _id: id, email: users[id].email }, process.env.ACCESS_TOKEN_SECRET)

async function call (method, path, { token, body, raw } = {}) {
  const res = await fetch(baseURL + path, {
    method,
    headers: {
      ...(body !== undefined || raw !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined
  })
  let data = null
  try {
    data = await res.json()
  } catch (e) {}
  return { status: res.status, data }
}

// ---------- auth ----------
test('sign up: creates a user, and rejects duplicates, short passwords and mismatching passwords', async () => {
  const body = { email: 'new@test.com', password: '123456', passwordVerify: '123456' }
  assert.equal((await call('POST', '/user/signup', { body })).status, 201)
  assert.equal((await call('POST', '/user/signup', { body })).status, 409)
  assert.equal(
    (await call('POST', '/user/signup', { body: { ...body, email: 'x@test.com', password: '123', passwordVerify: '123' } })).status,
    400
  )
  assert.equal(
    (await call('POST', '/user/signup', { body: { ...body, email: 'y@test.com', passwordVerify: 'nope' } })).status,
    400
  )
})

test('sign in: returns a token and never the password hash', async () => {
  const bad = await call('POST', '/user/signin', { body: { email: 'user@test.com', password: 'wrong' } })
  assert.equal(bad.status, 401)

  const ok = await call('POST', '/user/signin', { body: { email: 'user@test.com', password: '123456' } })
  assert.equal(ok.status, 200)
  assert.ok(ok.data.accessToken)
  assert.equal(ok.data.signedUser.email, 'user@test.com')
  assert.equal('password' in ok.data.signedUser, false)
  // the token expires
  assert.ok(jwt.decode(ok.data.accessToken).exp)
})

test('refresh: needs a valid token and returns a fresh one', async () => {
  assert.equal((await call('POST', '/user/refresh')).status, 401)
  assert.equal((await call('POST', '/user/refresh', { token: 'garbage' })).status, 401)
  const res = await call('POST', '/user/refresh', { token: tokenOf('u1') })
  assert.equal(res.status, 200)
  assert.equal(res.data.signedUser._id, 'u1')
})

// ---------- users ----------
test('users: private data is only available to the user himself or an admin', async () => {
  assert.equal((await call('GET', '/user/u1')).status, 401)
  assert.equal((await call('GET', '/user/u1', { token: tokenOf('u2') })).status, 403)

  const self = await call('GET', '/user/u1', { token: tokenOf('u1') })
  assert.equal(self.status, 200)
  assert.equal('password' in self.data.user, false)

  assert.equal((await call('GET', '/user/u1', { token: tokenOf('a1') })).status, 200)
})

test('users: list is admin only and has no password hashes', async () => {
  assert.equal((await call('GET', '/user/', { token: tokenOf('u1') })).status, 403)
  const res = await call('GET', '/user/', { token: tokenOf('a1') })
  assert.equal(res.status, 200)
  assert.equal(res.data.users.length, 3)
  assert.ok(res.data.users.every(u => !('password' in u)))
})

test('users: update own profile (password gets hashed), but not somebody else', async () => {
  assert.equal(
    (await call('PATCH', '/user/u2', { token: tokenOf('u1'), body: { firstName: 'Hacked' } })).status,
    403
  )
  const res = await call('PATCH', '/user/u1', {
    token: tokenOf('u1'),
    body: { firstName: 'New', password: 'abcdef' }
  })
  assert.equal(res.status, 200)
  assert.equal(res.data.user.firstName, 'New')
  assert.equal(users.u1.password, sha256('abcdef'))

  // fields that are not allowed (like permission) are rejected
  const bad = await call('PATCH', '/user/u1', { token: tokenOf('u1'), body: { permission: 'admin' } })
  assert.equal(bad.status, 400)
  assert.equal(users.u1.permission, 'user')
})

test('users: admins can promote / demote, but not demote themselves', async () => {
  assert.equal((await call('PATCH', '/user/u2/make-admin', { token: tokenOf('u1') })).status, 403)
  assert.equal((await call('PATCH', '/user/u2/make-admin', { token: tokenOf('a1') })).status, 200)
  assert.equal(users.u2.permission, 'admin')
  assert.equal((await call('DELETE', '/user/u2/make-admin', { token: tokenOf('a1') })).status, 200)
  assert.equal(users.u2.permission, 'user')
  assert.equal((await call('DELETE', '/user/a1/make-admin', { token: tokenOf('a1') })).status, 400)
})

test('admin router: lists admins (admin only)', async () => {
  require('../models/UsersDAO').getAdmins = async () =>
    Object.values(users).filter(u => u.permission === 'admin').map(withoutPassword)

  assert.equal((await call('GET', '/admin/')).status, 401)
  assert.equal((await call('GET', '/admin/', { token: tokenOf('u1') })).status, 403)
  const res = await call('GET', '/admin/', { token: tokenOf('a1') })
  assert.equal(res.status, 200)
  assert.deepEqual(res.data.admins.map(a => a._id), ['a1'])
})

// ---------- pets ----------
test('pets: search only passes the query to the DAO, and DAO whitelists the fields', async () => {
  const res = await call('GET', '/pet/?type=dog&size=m')
  assert.equal(res.status, 200)
  assert.deepEqual(lastCriteria, { type: 'dog', size: 'm' })

  // The real filter builder ignores operators / unknown fields (NoSQL injection)
  const filter = require('../models/PetsDAO').buildFilter({
    type: 'dog',
    name: 'a.b',
    owner: 'x',
    $where: '1==1',
    size: { $ne: 'xl' },
    hypoallergenic: 'true'
  })
  assert.equal(filter.type, 'dog')
  assert.equal(filter.hypoallergenic, true)
  assert.equal('owner' in filter, false)
  assert.equal('$where' in filter, false)
  assert.equal('size' in filter, false)
  assert.ok(filter.name instanceof RegExp)
  assert.ok(filter.name.test('a.b'))
  assert.equal(filter.name.test('axb'), false) // "." was escaped
  assert.deepEqual(filter.deleted, { $ne: true })

  assert.deepEqual(require('../models/PetsDAO').buildFilter({ size: 's,m' }).size, { $in: ['s', 'm'] })
})

test('pets: get one pet / 404', async () => {
  assert.equal((await call('GET', '/pet/p1')).data.pet.name, 'Rex')
  assert.equal((await call('GET', '/pet/nope')).status, 404)
})

test('pets: only admins create pets, and the body is validated', async () => {
  const body = { name: 'Fido', type: 'dog', size: 'l' }
  assert.equal((await call('POST', '/pet/new', { body })).status, 401)
  assert.equal((await call('POST', '/pet/new', { token: tokenOf('u1'), body })).status, 403)
  assert.equal((await call('POST', '/pet/new', { token: tokenOf('a1'), body: { name: 'x' } })).status, 400)
  const ok = await call('POST', '/pet/new', { token: tokenOf('a1'), body })
  assert.equal(ok.status, 201)
  assert.ok(ok.data.newPetID)
})

test('pets: adopt', async () => {
  assert.equal((await call('POST', '/pet/p1/adopt')).status, 401)
  const ok = await call('POST', '/pet/p1/adopt', { token: tokenOf('u1') })
  assert.equal(ok.status, 200)
  assert.equal(pets.p1.status, 'adoption')
  assert.equal(pets.p1.owner, 'u1')

  // already adopted by someone else
  assert.equal((await call('POST', '/pet/p2/adopt', { token: tokenOf('u1') })).status, 409)
  // fostered by me -> I can adopt it
  assert.equal((await call('POST', '/pet/p3/adopt', { token: tokenOf('u1') })).status, 200)
  assert.equal(pets.p3.status, 'adoption')
})

test('pets: foster really sets the foster status (it used to call adopt)', async () => {
  const ok = await call('POST', '/pet/p1/foster', { token: tokenOf('u1') })
  assert.equal(ok.status, 200)
  assert.equal(pets.p1.status, 'foster')
  assert.equal(pets.p1.owner, 'u1')
  // not available anymore
  assert.equal((await call('POST', '/pet/p1/foster', { token: tokenOf('u2') })).status, 409)
  assert.equal((await call('POST', '/pet/p2/foster', { token: tokenOf('u1') })).status, 409)
})

test('pets: only the owner can return a pet', async () => {
  assert.equal((await call('DELETE', '/pet/p2/adopt', { token: tokenOf('u1') })).status, 403)
  assert.equal((await call('DELETE', '/pet/p1/adopt', { token: tokenOf('u1') })).status, 403) // available
  assert.equal((await call('DELETE', '/pet/p2/adopt', { token: tokenOf('u2') })).status, 200)
  assert.equal(pets.p2.status, 'available')
  assert.equal(pets.p2.owner, null)
  assert.equal((await call('DELETE', '/pet/p3/foster', { token: tokenOf('u1') })).status, 200)
  assert.equal(pets.p3.status, 'available')
})

test('pets: save / unsave in the wish list', async () => {
  assert.equal((await call('POST', '/pet/p1/save', { token: tokenOf('u1') })).status, 200)
  assert.equal((await call('POST', '/pet/p1/save', { token: tokenOf('u1') })).status, 409)
  assert.deepEqual(users.u1.petsWishList, ['p1'])
  assert.equal((await call('DELETE', '/pet/p1/save', { token: tokenOf('u1') })).status, 200)
  assert.equal((await call('DELETE', '/pet/p1/save', { token: tokenOf('u1') })).status, 404)
})

test('pets: a user gets his saved and owned pets', async () => {
  users.u1.petsWishList = ['p1']
  const res = await call('GET', '/pet/user/u1', { token: tokenOf('u1') })
  assert.equal(res.status, 200)
  assert.deepEqual(res.data.saved.map(p => p._id), ['p1'])
  assert.deepEqual(res.data.owned.map(p => p._id), ['p3'])

  assert.equal((await call('GET', '/pet/user/u1')).status, 401)
  assert.equal((await call('GET', '/pet/user/u1', { token: tokenOf('u2') })).status, 403)
})

test('pets: only admins edit / delete pets', async () => {
  assert.equal((await call('PATCH', '/pet/p1', { token: tokenOf('u1'), body: { name: 'X' } })).status, 403)
  assert.equal((await call('PATCH', '/pet/p1', { token: tokenOf('a1'), body: { name: 'Max' } })).status, 200)
  assert.equal(pets.p1.name, 'Max')
  assert.equal((await call('PATCH', '/pet/p1', { token: tokenOf('a1'), body: { size: 'huge' } })).status, 400)

  // marking as available frees the pet from its owner
  assert.equal((await call('PATCH', '/pet/p2', { token: tokenOf('a1'), body: { status: 'available' } })).status, 200)
  assert.equal(pets.p2.owner, null)

  assert.equal((await call('DELETE', '/pet/p1', { token: tokenOf('u1') })).status, 403)
  assert.equal((await call('DELETE', '/pet/p1', { token: tokenOf('a1') })).status, 200)
  assert.equal(pets.p1.deleted, true)
})

// ---------- general ----------
test('malformed JSON and unknown endpoints get proper JSON errors', async () => {
  assert.equal((await call('POST', '/user/signin', { raw: '{bad json' })).status, 400)
  assert.equal((await call('GET', '/nothing-here')).status, 404)
})
