import React from "react";
import MainLayout from './layout/MainLayout'
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
import Home from './pages/Home/Home';

const routes = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout><Home /></MainLayout>
    },
    {
        path: '/admin',
        element: <AdminLayout/>
    },
    {
        path: '/sign-up',
        element: <MainLayout><SignUpForm /></MainLayout>
    },
    {
        path: '/sign-in',
        element: <MainLayout><SignUpForm /></MainLayout>
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
        element: <MainLayout><ExerciseHome /></MainLayout>
    },
    {
        path: '/exercise-post/:id',
        element: <MainLayout><ExerciseDetail /></MainLayout>
    },
    {
        path: '/exercise/:id',
        element: <MainLayout><ExerciseDetail /></MainLayout>
    },
    {
        path: '/plan',
        element: <MainLayout><Plan /></MainLayout>
    },
    {
        path: '/plans',
        element: <ProfileSidebar initialTab="plans"/>
    },
    {
        path: '/pt/exercises',
        element: <MainLayout><ExerciseManagement /></MainLayout>
    },
    {
        path: '/gymowner/approve-exercises',
        element: <MainLayout><ExerciseApproval /></MainLayout>
    },
    {
        path: '/gymowner/pt-management',
        element: <MainLayout><PTManagement /></MainLayout>
    },
    {
        path: '/register-pt',
        element: <MainLayout><FormPT /></MainLayout>
    },
    {
        path: '/gyms',
        element: <MainLayout><GymList /></MainLayout>
    },
    {
        path: '/users/public/:id',
        element: <MainLayout><GymDetail /></MainLayout>
    },
    {
        path: '/payment-status',
        element: <MainLayout><PaymentStatus /></MainLayout>
    },
    {
        path: '/payment-callback',
        element: <MainLayout><PaymentCallback /></MainLayout>
    },
    {
        path: '/admin/*',
        element: <AdminLayout/>
    },
    {
        path: '/pt-list',
        element: <MainLayout><TrainerList /></MainLayout>
    },
    {
        path: '/gymowner/approve-pt',
        element: <MainLayout><GymOwnerApprovalPage /></MainLayout>
    },
    {
        path: '/plan-detail',
        element: <MainLayout><PlanList /></MainLayout>
    }
]);

export default routes;
