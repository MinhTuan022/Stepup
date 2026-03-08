
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UserProfilePage from './pages/UserProfilePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import Layout from './components/Layout'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollRestoration from './components/ScrollRestoration'
import CategoryPage from './pages/CategoryPage'


function AppContent() {
  const { isAuthenticated, user } = useAuth();
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {isAuthenticated && (user?.vaiTro === 'quan_tri' || user?.vaiTro === 'nhan_vien') && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
        {isAuthenticated && user?.vaiTro !== 'quan_tri' && user?.vaiTro !== 'nhan_vien' && (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </>
        )}
        <Route
          path="*"
          element={
            isAuthenticated
              ? (user?.vaiTro === 'quan_tri' || user?.vaiTro === 'nhan_vien')
                ? <Navigate to="/admin" />
                : <Navigate to="/" />
              : <Navigate to="/login" />
          }
        />
      </Routes>
    </Layout>
  );
}


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollRestoration />
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
