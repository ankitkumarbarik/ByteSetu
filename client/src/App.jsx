import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ReviewerDashboard from './pages/Dashboard/ReviewerDashboard';
import AuthorDashboard from './pages/Dashboard/AuthorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicSubmission from './pages/PublicSubmission';
import LandingPage from './pages/LandingPage';
import PublishedPapers from './pages/PublishedPapers';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaperDetails from './pages/PaperDetails';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const Unauthorized = () => <div className="p-10 text-red-500">Unauthorized Access</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/published-papers" element={<PublishedPapers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Reviewer Routes */}
            <Route
              path="/reviewer/*"
              element={
                <ProtectedRoute allowedRoles={['reviewer']}>
                  <ReviewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Author Routes */}
            <Route
              path="/author/*"
              element={
                <ProtectedRoute allowedRoles={['author']}>
                  <AuthorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Common Protected Routes */}
            <Route
              path="/paper/:id"
              element={
                <ProtectedRoute allowedRoles={['author', 'reviewer', 'admin']}>
                  <PaperDetails />
                </ProtectedRoute>
              }
            />

            <Route path="/submit-paper" element={<PublicSubmission />} />

            {/* Catch all - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
