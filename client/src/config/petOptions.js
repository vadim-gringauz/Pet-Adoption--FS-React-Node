// The values must be the same as the server's pet model (server/models/PetsDAO.js)
export const PET_TYPES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' }
]

export const PET_SIZES = [
  { value: 'xs', label: 'Extra small' },
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large' }
]

export const PET_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'foster', label: 'Fostered' },
  { value: 'adoption', label: 'Adopted' }
]

export const labelOf = (options, value) =>
  options.find(option => option.value === value)?.label ?? value ?? '-'
