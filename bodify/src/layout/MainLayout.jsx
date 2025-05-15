import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Chatbox from '../components/Chatbox/Chatbox';
import AuthService from '../services/auth.service';
import ChatService from '../services/chat.service';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isProfilePage = location.pathname.includes('/profile') || 
                       location.pathname.includes('/userprofile') ||
                       location.pathname.includes('/user');
  const currentUser = AuthService.getCurrentUser();
  const isLoggedIn = currentUser !== null;
  const isGymOwner = currentUser && currentUser.role_id === 4;

  // Ensure chat is initialized for gym owners
  useEffect(() => {
    if (isGymOwner && currentUser.id) {
      // Connect to chat socket
      ChatService.connect(currentUser.id);
      
      // Make sure chat bubble is visible
      setTimeout(() => {
        const chatboxContainer = document.querySelector('.chatbox-container');
        if (chatboxContainer) {
          chatboxContainer.style.display = 'block';
          chatboxContainer.style.zIndex = '9999';
        }
      }, 500);
    }

    return () => {
      if (isGymOwner) {
        ChatService.disconnect();
      }
    };
  }, [isGymOwner, currentUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {/* Always show chat for gym owners, otherwise show only if not on profile page and logged in */}
      {(isGymOwner || (!isProfilePage && isLoggedIn)) && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbox />
        </div>
      )}
      <Footer />
      
      {/* Add global styles to ensure chatbox is always visible for gym owners */}
      {isGymOwner && (
        <style jsx>{`
          .chatbox-container {
            display: block !important;
            z-index: 9999 !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default MainLayout; 