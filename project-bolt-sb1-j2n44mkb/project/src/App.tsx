import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LocationPage from './pages/LocationPage';
import TouristPlacesPage from './pages/TouristPlacesPage';
import TransportHotelsPage from './pages/TransportHotelsPage';
import RoutePlanningPage from './pages/RoutePlanningPage';
import ExplorePage from './pages/ExplorePage';
import OrderPage from './pages/OrderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminTouristSpots from './pages/admin/AdminTouristSpots';
import AdminTransportHotels from './pages/admin/AdminTransportHotels';
import AdminExplore from './pages/admin/AdminExplore';
import AdminOrders from './pages/admin/AdminOrders';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LocationPage />} />
           <Route path="/explore/:id" element={<ExplorePage />} />
            <Route path="/tourist-places" element={<TouristPlacesPage />} />
            <Route path="/transport-hotels" element={<TransportHotelsPage />} />
            <Route path="/route-planning" element={<RoutePlanningPage />} />
            <Route path="/order" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/routes" element={<AdminRoute><AdminRoutes /></AdminRoute>} />
            <Route path="/admin/tourist-spots" element={<AdminRoute><AdminTouristSpots /></AdminRoute>} />
            <Route path="/admin/transport-hotels" element={<AdminRoute><AdminTransportHotels /></AdminRoute>} />
            <Route path="/admin/explore" element={<AdminRoute><AdminExplore /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;