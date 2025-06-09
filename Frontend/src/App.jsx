import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserJoin from './components/UserJoin';
import PollSession from './components/PollSession';
import './App.css';

const App = () => {
  // Protected Route component
  const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
      return <Navigate to="/join" replace />;
    }

    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/join" 
            element={
              <ProtectedRoute>
                <UserJoin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/session/:code" 
            element={
              <ProtectedRoute>
                <PollSession />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 