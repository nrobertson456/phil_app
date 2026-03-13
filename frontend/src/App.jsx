import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import CornerSparkles from './components/CornerSparkles';
import Fairy from './components/Fairy';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [showFairy, setShowFairy] = useState(true);

  return (
    <AuthProvider>
      <CornerSparkles />
      {showFairy && (
        <Fairy onComplete={() => setShowFairy(false)} />
      )}
      <AppRoutes />
    </AuthProvider>
  );
}
