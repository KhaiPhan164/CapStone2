import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbox from '../components/Chatbox/Chatbox';
import AuthService from '../services/auth.service';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isProfilePage = location.pathname.includes('/profile') || 
                       location.pathname.includes('/userprofile') ||
                       location.pathname.includes('/user');
  const isLoggedIn = AuthService.getCurrentUser() !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {!isProfilePage && isLoggedIn && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbox />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MainLayout; 