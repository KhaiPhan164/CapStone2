import React from "react";
import Main from './layout/Main'
import SignUpForm from './pages/Login/login'
import UserInformation from './pages/UserProfile/UserInformation'
import AdminLayout from './pages/Admin/AdminLayout'
import { ExerciseHome } from './pages/Exercise'
import { ExerciseDetail } from './pages/Exercise/ExerciseDetail'
import Plan from './pages/UserProfile/User/Plan'
import ExerciseManagement from './pages/UserProfile/PT/ExerciseManagement'
import PTManagement from './pages/UserProfile/GymOwner/PTManagement'
import ProfileSidebar from './pages/UserProfile/ProfileSidebar'
import FormPT from './pages/Register/FormPT'

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
        path: '/login',
        element: <SignUpForm/>
    },
    {
        path: '/register',
        element: <FormPT/>
    },
    {
        path: '/userprofile',
        element: <ProfileSidebar/>
    },
    {
        path: '/profile',
        element: <ProfileSidebar/>
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
        path: '/exercise/:id',
        element: <ExerciseDetail/>
    },
    {
        path: '/plan',
        element: <Plan/>
    },
    {
        path: '/plans',
        element: <ProfileSidebar initialTab="plans"/>
    },
    {
        path: '/pt/exercise-management',
        element: <ExerciseManagement/>
    },
    {
        path: '/gymowner/pt-management',
        element: <PTManagement/>
    },
    {
        path: '/register-pt',
        element: <FormPT/>
    },
    {
        path: '/admin/*',
        element: <AdminLayout/>
    }
]
