import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import HomeLayout from './HomeLayout';

const ProtectedLayout = () => {
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <HomeLayout />;
};

export default ProtectedLayout;
