import Main from './layout/Main'
import SignUpForm from './pages/Login/login'
import UserInformation from './pages/UserProfile/UserInformation'
import AdminLayout from './pages/Admin/AdminLayout'
import { ExerciseHome } from './pages/Exercise'
import { ExerciseDetail } from './pages/Exercise/ExerciseDetail'
import Plan from './pages/UserProfile/User/Plan'

export const ROUTES  = [
    {
        path: '/',
        element: <Main/>
    }, 
    {
        path: '/admin',
        element: <AdminLayout/>
    },
    {
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
    },
    {
        path: '/user',
        element: <UserInformation/>
    },
    {
        path: '/exercise',
        element: <ExerciseHome/>
    },
    {
        path: '/exercise-post/:id',
        element: <ExerciseDetail/>
    },
    {
        path: '/plan',
        element: <Plan/>
    },
    {
        path: '/plans',
        element: <UserInformation/>
    }
]