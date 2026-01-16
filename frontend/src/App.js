import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmissionDetail from './pages/SubmissionDetail';
import AllCases from './pages/AllCases';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/patient'} /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/patient">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="all-cases"
            element={
              <ProtectedRoute requiredRole="patient">
                <AllCases />
              </ProtectedRoute>
            }
          />
          <Route
            path="all-cases/submission/:id"
            element={
              <ProtectedRoute requiredRole="patient">
                <SubmissionDetail />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submission/:id"
          element={
            <ProtectedRoute>
              <SubmissionDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}

export default App;