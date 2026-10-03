import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProblems from './pages/student/StudentProblems';
import StudentItems from './pages/student/StudentItems';
import StudentLaundry from './pages/student/StudentLaundry';
import StudentFood from './pages/student/StudentFood';
import ProblemWorkerDashboard from './pages/worker/ProblemWorkerDashboard';
import ItemWorkerDashboard from './pages/worker/ItemWorkerDashboard';
import LaundryWorkerDashboard from './pages/worker/LaundryWorkerDashboard';
import CookDashboard from './pages/cook/CookDashboard';
import StudentElectricity from './pages/student/StudentElectricity';
import AccountantDashboard from './pages/accountant/AccountantDashboard';

// A simple protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <div>Unauthorized access. You do not have the right role.</div>;
  }

  return children;
};

// Root Dashboard Router (Redirects based on role)
const DashboardRouter = () => {
  const { profile, loading, profileError, signOut } = useAuth();
  
  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return (
    <div className="p-8 text-center max-w-lg mx-auto mt-20 bg-white rounded shadow border border-red-100">
      <h2 className="text-xl font-bold text-red-600 mb-4">Profile Setup Incomplete</h2>
      {profileError && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4 text-sm font-mono text-left break-words">
          <strong>Database Error:</strong> {profileError}
        </div>
      )}
      <p className="text-gray-600 mb-6">We couldn't load or create your user profile. Please try logging out and registering again.</p>
      <button onClick={signOut} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition">Log Out</button>
    </div>
  );
  
  switch(profile.role) {
    case 'student': return <Navigate to="/student/dashboard" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'worker_problem': return <Navigate to="/worker/problems" replace />;
    case 'worker_laundry': return <Navigate to="/worker/items" replace />;
    case 'cook': return <Navigate to="/cook/dashboard" replace />;
    case 'accountant': return <Navigate to="/accountant/dashboard" replace />;
    default: return <div>Unknown role</div>;
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes with Layout */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            
            {/* Base route handles redirect based on user role */}
            <Route index element={<DashboardRouter />} />

            {/* Student Routes */}
            <Route path="student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="student/problems" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProblems />
              </ProtectedRoute>
            } />
            <Route path="student/items" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentItems />
              </ProtectedRoute>
            } />
            <Route path="student/laundry" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLaundry />
              </ProtectedRoute>
            } />
            <Route path="student/food" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentFood />
              </ProtectedRoute>
            } />
            <Route path="student/electricity" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentElectricity />
              </ProtectedRoute>
            } />
            <Route path="student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="p-8 text-center text-gray-500">Feature Coming Soon in Phase 9+</div>
              </ProtectedRoute>
            } />

            {/* Worker Routes */}
            <Route path="worker/problems" element={
              <ProtectedRoute allowedRoles={['worker_problem', 'admin']}>
                <ProblemWorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="worker/items" element={
              <ProtectedRoute allowedRoles={['worker_laundry', 'admin']}>
                <ItemWorkerDashboard />
              </ProtectedRoute>
            } />
            <Route path="worker/laundry" element={
              <ProtectedRoute allowedRoles={['worker_laundry', 'admin']}>
                <LaundryWorkerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Cook Routes */}
            <Route path="cook/dashboard" element={
              <ProtectedRoute allowedRoles={['cook', 'admin']}>
                <CookDashboard />
              </ProtectedRoute>
            } />

            {/* Accountant Routes */}
            <Route path="accountant/dashboard" element={
              <ProtectedRoute allowedRoles={['accountant', 'admin']}>
                <AccountantDashboard />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-8 text-center text-gray-500">Admin Dashboard (Coming Soon)</div>
              </ProtectedRoute>
            } />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
