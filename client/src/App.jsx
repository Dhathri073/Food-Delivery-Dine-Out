import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { connectSocket } from './lib/socket';

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

export default function App() {
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token) connectSocket(token);
  }, [token]);

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        {/* Delivery Routes */}
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />

        {/* Dine-Out Routes */}
        <Route path="/dineout" element={<DineOut />} />
        <Route path="/dineout/:id" element={<DineOutDetail />} />

        {/* Events Routes */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute roles={['restaurant_owner']} />}>
          <Route path="/merchant" element={<MerchantDashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['courier']} />}>
          <Route path="/courier" element={<CourierDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
