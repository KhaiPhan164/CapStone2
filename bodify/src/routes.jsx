import React from "react";
import Main from './layout/Main'
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

const withMainLayout = (Component) => {
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
};

const routes = createBrowserRouter([
    {
        path: '/',
        element: withMainLayout(Main)
    },
    {
        path: '/admin',
        element: <AdminLayout/>
    },
    {
        path: '/sign-up',
        element: withMainLayout(SignUpForm)
    },
    {
        path: '/sign-in',
        element: withMainLayout(SignUpForm)
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
        element: withMainLayout(ExerciseHome)
    },
    {
        path: '/exercise-post/:id',
        element: withMainLayout(ExerciseDetail)
    },
    {
        path: '/exercise/:id',
        element: withMainLayout(ExerciseDetail)
    },
    {
        path: '/plan',
        element: withMainLayout(Plan)
    },
    {
        path: '/plans',
        element: <ProfileSidebar initialTab="plans"/>
    },
    {
        path: '/pt/exercises',
        element: withMainLayout(ExerciseManagement)
    },
    {
        path: '/gymowner/approve-exercises',
        element: withMainLayout(ExerciseApproval)
    },
    {
        path: '/gymowner/pt-management',
        element: withMainLayout(PTManagement)
    },
    {
        path: '/register-pt',
        element: withMainLayout(FormPT)
    },
    {
        path: '/gyms',
        element: withMainLayout(GymList)
    },
    {
        path: '/users/public/:id',
        element: withMainLayout(GymDetail)
    },
    {
        path: '/payment-status',
        element: withMainLayout(PaymentStatus)
    },
    {
        path: '/payment-callback',
        element: withMainLayout(PaymentCallback)
    },
    {
        path: '/admin/*',
        element: <AdminLayout/>
    },
    {
        path: '/pt-list',
        element: withMainLayout(TrainerList)
    },
    {
        path: '/gymowner/approve-pt',
        element: withMainLayout(GymOwnerApprovalPage)
    },
    {
        path: '/plan-detail',
        element: withMainLayout(PlanList)
    }
]);

export default routes;
