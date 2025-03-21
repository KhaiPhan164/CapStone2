import Main from './layout/Main'
import SignUpForm from './pages/Login/login'
import UserInformation from './pages/UserProfile/UserInformation'
import AdminLayout from './pages/Admin/AdminLayout'
import { ExerciseHome } from './pages/Exercise'
import { ExerciseDetail } from './pages/Exercise/ExerciseDetail'
import ExerciseManagement from './pages/UserProfile/PT/ExerciseManagement'
import PTManagement from './pages/UserProfile/GymOwner/PTManagement'

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
        path: '/exercise',
        element: <ExerciseHome/>
    },
    {
        path: '/exercise-post',
        element: <ExerciseDetail/>
    },
    {
        path: '/pt/exercise-management',
        element: <ExerciseManagement/>
    },
    {
        path: '/gymowner/pt-management',
        element: <PTManagement/>
    },
]