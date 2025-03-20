import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import UserInformation from './UserInformation';
import AdminProfile from './AdminProfile';
import PTProfile from './PTProfile';
import GymOwnerProfile from './GymOwnerProfile';
import axios from 'axios';

const UserProfile = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      let accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate('/sign-in');
        return;
      }

      try {
        const decodedToken = jwtDecode(accessToken);
        setRole(decodedToken.role);

        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log('Access token đã hết hạn, đang làm mới...');
          const refreshResponse = await axios.post(
            'http://localhost:3000/auth/refresh',
            {},
            { withCredentials: true }
          );
          accessToken = refreshResponse.data.accessToken;
          localStorage.setItem('accessToken', accessToken);
          setRole(jwtDecode(accessToken).role);
        }
      } catch (error) {
        console.error('Token không hợp lệ:', error);
        localStorage.removeItem('accessToken');
        navigate('/sign-in');
      }
    };

    checkToken();
  }, [navigate]);

  const renderProfile = () => {
    switch (role) {
      case 1:
        return <AdminProfile />;
      case 2:
        return <UserInformation />;
      case 3:
        return <PTProfile />;
      case 4:
        return <GymOwnerProfile />;
      default:
        return <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>;
    }
  };

  return (
    <div>
      {renderProfile()}
    </div>
  );
};

export default UserProfile; 