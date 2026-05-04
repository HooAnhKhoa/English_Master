import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Higher Order Component to protect admin routes
 */
const withAdmin = (Component) => {
  return (props) => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Check if user exists and has admin role
    if (!user || user.role !== 'admin') {
      console.warn('Access denied: Admin role required');
      return <Navigate to="/dashboard" replace />;
    }

    return <Component {...props} />;
  };
};

export default withAdmin;
