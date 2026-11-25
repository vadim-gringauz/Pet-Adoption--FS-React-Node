import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import PrivateRoute from '../helpers/PrivateRoute'
import AdminRoute from '../helpers/AdminRoute'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import ContactUsPage from '../pages/ContactUsPage'
import SignInPage from '../pages/SignInPage'
import ErrorPage from '../pages/ErrorPage'
import PetPage from '../pages/PetPage'
import PetDetailsPage from '../pages/PetDetailsPage'
import SearchPage from '../pages/SearchPage'
import WishList from '../pages/WishList'
import MyPetsPage from '../pages/MyPetsPage'
import ProfileSettings from '../pages/ProfileSettings'
import Dashboard from '../pages/Dashboard'
import AddPetPage from '../pages/AddPetPage'
import Article from '../pages/Article'
import SignOutTemp from '../pages/SignOutTemp'
import RemeberSignedUser from '../helpers/RemeberSignedUser'

const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        // every page is inside RemeberSignedUser, so a signed user stays signed in
        // when the page is reloaded (also on the public pages)
        element: <RemeberSignedUser />,
        children: [
          //! PUBLIC PAGES
          {
            path: '/signin',
            element: <SignInPage />
          },
          {
            path: '/about',
            element: <AboutPage />
          },
          {
            path: '/contact',
            element: <ContactUsPage />
          },
          {
            path: '/pets',
            element: <PetPage />
          },
          {
            path: '/pets/:id',
            element: <PetDetailsPage />
          },
          {
            path: '/search',
            element: <SearchPage />
          },
          {
            path: '/why-adopt-article',
            element: <Article />
          },

          //! SIGNED IN USERS (visitors get the welcome page)
          {
            element: <PrivateRoute />,
            children: [
              {
                path: '/',
                element: <HomePage />
              },
              {
                path: '/wish-list',
                element: <WishList />
              },
              {
                path: '/my-pets',
                element: <MyPetsPage />
              },
              {
                path: '/profile',
                element: <ProfileSettings />
              },
              {
                path: '/signout',
                element: <SignOutTemp />
              },

              //! ADMINS ONLY
              {
                element: <AdminRoute />,
                children: [
                  {
                    path: '/dashboard',
                    element: <Dashboard />
                  },
                  {
                    path: '/dashboard/pets/new',
                    element: <AddPetPage />
                  },
                  {
                    path: '/dashboard/pets/:id/edit',
                    element: <AddPetPage />
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        // anything else
        path: '*',
        element: <ErrorPage />
      }
    ]
  }
])

export default router
