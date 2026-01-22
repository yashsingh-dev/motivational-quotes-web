
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardOverview from './components/dashboard/DashboardOverview';
import UsersSection from './components/dashboard/UsersSection';
import ImagesSection from './components/dashboard/ImagesSection';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Check for redirecting away from login if already authenticated
const PublicOnlyRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route redirects based on Auth */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Nested Routes */}
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<UsersSection />} />
          <Route path="quotes" element={<ImagesSection />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

