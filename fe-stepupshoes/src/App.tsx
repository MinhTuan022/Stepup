
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


function AppContent() {
  const { isAuthenticated, user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {isAuthenticated && user?.vaiTro === 'quan_tri' && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
      {isAuthenticated && user?.vaiTro !== 'quan_tri' && (
        <Route path="/" element={<HomePage />} />
      )}
      <Route
        path="*"
        element={
          isAuthenticated
            ? user?.vaiTro === 'quan_tri'
              ? <Navigate to="/admin" />
              : <Navigate to="/" />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
