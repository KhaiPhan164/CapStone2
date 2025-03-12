import Main from './layout/Main'
import SignUpForm from './pages/Login/login'
import UserInformation from './pages/UserProfile/UserInformation'

export const ROUTES  = [
    {
        path: '/',
        element: <Main/>
    }, {
        path: '/sign-up',
        element: <SignUpForm/>
    },
    {
        path: '/sign-in',
        element: <SignUpForm/>
    },
    {
        path: '/userprofile',
        element: <UserInformation/>
    }
]