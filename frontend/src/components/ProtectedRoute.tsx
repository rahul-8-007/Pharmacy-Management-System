import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import type { ReactElement } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
