import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { useAuthInit } from './hooks/useAuthInit';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Delivery from './pages/Delivery';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import DineOut from './pages/DineOut';
import DineOutDetail from './pages/DineOutDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';

// Role dashboards
import MerchantDashboard from './pages/merchant/Dashboard';
import CourierDashboard from './pages/courier/Dashboard';
import Checkout from './pages/Checkout';

// Smart redirect based on role after login
function RoleHome() {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'restaurant_owner') return <Navigate to="/merchant" replace />;
  if (user?.role === 'courier') return <Navigate to="/courier" replace />;
  return <Home />;
}

export default function App() {
  const { token, user } = useAuthStore();
  useAuthInit();

  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={!token ? <Login /> : (
        user?.role === 'restaurant_owner' ? <Navigate to="/merchant" replace /> :
        user?.role === 'courier' ? <Navigate to="/courier" replace /> :
        <Navigate to="/" replace />
      )} />
      <Route path="/register" element={!token ? <Register /> : (
        user?.role === 'restaurant_owner' ? <Navigate to="/merchant" replace /> :
        user?.role === 'courier' ? <Navigate to="/courier" replace /> :
        <Navigate to="/" replace />
      )} />

      {/* ── Customer Layout ─────────────────────────────────── */}
      <Route element={<Layout />}>
        <Route path="/" element={<RoleHome />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route path="/dineout" element={<DineOut />} />
        <Route path="/dineout/:id" element={<DineOutDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ── Merchant Layout ─────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={['restaurant_owner']} />}>
        <Route path="/merchant/*" element={<MerchantDashboard />} />
      </Route>

      {/* ── Courier Layout ──────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={['courier']} />}>
        <Route path="/courier/*" element={<CourierDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
