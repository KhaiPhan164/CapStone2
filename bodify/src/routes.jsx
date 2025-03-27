import React from "react";
import { Routes, Route } from "react-router-dom";
import Main from './layout/Main';
import SignUpForm from './pages/Login/login';
import UserInformation from './pages/UserProfile/ProfileSidebar';
import AdminLayout from './pages/Admin/AdminLayout';
import { ExerciseHome } from './pages/Exercise';
import { ExerciseDetail } from './pages/Exercise/ExerciseDetail';
import ExerciseManagement from './pages/UserProfile/PT/ExerciseManagement';
import PTManagement from './pages/UserProfile/GymOwner/PTManagement';
import FormPT from './pages/Register/FormPT';

export const ROUTES = [
  {
    path: '/',
    element: <Main />
  },
  {
    path: '/login',
    element: <SignUpForm />
  },
  {
    path: '/register',
    element: <FormPT />
  },
  {
    path: '/exercise',
    element: <ExerciseHome />
  },
  {
    path: '/exercise/:id',
    element: <ExerciseDetail />
  },
  {
    path: '/pt/exercise-management',
    element: <ExerciseManagement />
  },
  {
    path: '/gymowner/pt-management',
    element: <PTManagement />
  },
  {
    path: '/profile',
    element: <UserInformation />
  },
  {
    path: '/admin/*',
    element: <AdminLayout />
  }
];