// The user menu (the avatar in the navbar)
// permission: 'all' = every signed in user, 'admin' = only admins
const userSettings = [
    {
        name: 'Profile/Account',
        path: '/profile',
        permission: 'all',
    },
    {
        name: 'My Pets',
        path: '/my-pets',
        permission: 'all',
    },
    {
        name: 'Dashboard',
        path: '/dashboard',
        permission: 'admin',
    },
]

export default userSettings
