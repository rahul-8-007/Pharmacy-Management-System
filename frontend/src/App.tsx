import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddStock from './pages/AddStock';
import SellTablets from './pages/SellTablets';
import Inventory from './pages/Inventory';
import Predictions from './pages/Predictions';
import SalesHistory from './pages/SalesHistory';
import Layout from './components/Layout';

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-stock" element={<AddStock />} />
        <Route path="/sell" element={<SellTablets />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/predictions" element={<Predictions />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
