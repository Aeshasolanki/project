import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Customer Pages
import Home from './pages/Customer/Home';
import DesignDetails from './pages/Customer/DesignDetails';
import MeasurementWizard from './pages/Customer/MeasurementWizard';
import OrderCheckout from './pages/Customer/OrderCheckout';
import OrderTracking from './pages/Customer/OrderTracking';
import OrderDetails from './pages/Customer/OrderDetails';
import Profile from './pages/Customer/Profile';
import Favorites from './pages/Customer/Favorites';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Shop Pages
import ShopDashboard from './pages/Shop/Dashboard';
import ShopDesigns from './pages/Shop/Designs';
import ShopOrders from './pages/Shop/Orders';
import ShopOnboarding from './pages/Shop/Onboarding';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCertifications from './pages/Admin/Certifications';
import AdminOrders from './pages/Admin/Orders';
import AdminPricing from './pages/Admin/Pricing';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Customer Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/designs/:id" element={<DesignDetails />} />
        
        <Route
          path="/measurement-wizard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MeasurementWizard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderCheckout />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Favorites />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Shop Routes */}
      <Route
        path="/shop/*"
        element={
          <ProtectedRoute allowedRoles={['shop']}>
            <Routes>
              <Route path="/" element={<ShopDashboard />} />
              <Route path="/onboarding" element={<ShopOnboarding />} />
              <Route path="/designs" element={<ShopDesigns />} />
              <Route path="/orders" element={<ShopOrders />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/certifications" element={<AdminCertifications />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/pricing" element={<AdminPricing />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
