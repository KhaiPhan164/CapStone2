import React from "react";
import Main from './layout/Main'
import SignUpForm from './pages/Login/login'
import UserInformation from './pages/UserProfile/UserInformation'
import AdminLayout from './pages/Admin/AdminLayout'
import { ExerciseHome } from './pages/Exercise'
import { ExerciseDetail } from './pages/Exercise/ExerciseDetail'
import Plan from './pages/UserProfile/User/Plan'
import ExerciseManagement from './pages/Exercise/ExerciseManagement'
import ExerciseApproval from './pages/Exercise/ExerciseApproval'
import PTManagement from './pages/UserProfile/GymOwner/PTManagement'
import ProfileSidebar from './pages/UserProfile/ProfileSidebar'
import FormPT from './pages/Register/FormPT'
import GymList from './GymList'
import GymDetail from './GymDetail'
import PaymentStatus from './pages/Payment/PaymentStatus'
import PaymentCallback from './pages/Payment/PaymentCallback'
import { createBrowserRouter } from 'react-router-dom';
import TrainerList from "./pages/PTList/TrainerList";
import GymOwnerApprovalPage from './pages/Approval/GymOwnerApprovalPage';
import PlanList from "./pages/PlanDetail/PlanList";

const routes = createBrowserRouter([
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
        path: '/pt/exercises',
        element: <ExerciseManagement/>
    },
    {
        path: '/gymowner/approve-exercises',
        element: <ExerciseApproval/>
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
        path: '/gyms',
        element: <GymList/>
    },
    {
        path: '/users/public/:id',
        element: <GymDetail/>
    },
    {
        path: '/payment-status',
        element: <PaymentStatus/>
    },
    {
        path: '/payment-callback',
        element: <PaymentCallback/>
    },
    {
        path: '/admin/*',
        element: <AdminLayout/>
    },
    {
        path: '/pt-list',
        element: <TrainerList/>
    },
    {
        path: '/gymowner/approve-pt',
        element: <GymOwnerApprovalPage/>
    },
    {
        path: '/plan-detail',
        element: <PlanList/>
    }
]);

export default routes;
