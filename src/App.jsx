import { Route, Routes } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import UniversityLayout from './components/UniversityLayout';
import ProtectedRoute from './context/ProtectedRoute';
import Home from './pages/Home';
import MyCart from './pages/MyCart';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import UniversityDashboard from './pages/UniversityDashboard';

export default function App() {
  return <Routes>
    <Route element={<UniversityLayout />}>
      <Route path="/university/dashboard" element={<ProtectedRoute allowedRoles={['University']}><UniversityDashboard /></ProtectedRoute>} />
    </Route>
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/my-cart" element={<ProtectedRoute><MyCart /></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
