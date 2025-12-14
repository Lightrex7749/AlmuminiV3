import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 ProtectedRoute: No user found, showing login toast');
      toast.info('Please login to access this feature', {
        description: 'You need to be logged in to view this page',
      });
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check both context user and localStorage as fallback
  const storedUser = localStorage.getItem('user');
  const hasAuth = user || storedUser;
  
  console.log('🔒 ProtectedRoute check:', { 
    hasContextUser: !!user, 
    hasStoredUser: !!storedUser,
    hasAuth: !!hasAuth,
    path: location.pathname 
  });

  if (!hasAuth) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Use context user if available, otherwise parse from localStorage
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    toast.error('Access Denied', {
      description: 'You do not have permission to access this page',
    });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
