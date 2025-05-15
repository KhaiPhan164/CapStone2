import React from 'react';
import Home from './Home';
import AuthService from '../../services/auth.service';
import Dashboard from '../../pages/Dashboard/SidebarPT';
import MainLayout from '../../layout/MainLayout';

const HomeRouter = () => {
  // Kiểm tra người dùng hiện tại
  const currentUser = AuthService.getCurrentUser();
  
  // Nếu là gym owner (role_id = 4), hiển thị Dashboard trực tiếp
  if (currentUser && currentUser.role_id === 4) {
    console.log('Gym owner đang truy cập trang chủ, hiển thị dashboard');
    return <Dashboard />;
  }
  
  // Các vai trò khác sẽ thấy trang chủ bình thường trong MainLayout
  return <MainLayout><Home /></MainLayout>;
};

export default HomeRouter; 