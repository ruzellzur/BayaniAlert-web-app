import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Board from './pages/Board';
import Map from './pages/Map';
import Checkin from './pages/Checkin';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPuroks from './pages/admin/AdminPuroks';
import AdminEvac from './pages/admin/AdminEvac';
import ResourceDetail from './pages/ResourceDetail';
import MessageThread from './pages/MessageThread';
import WeatherHistory from './pages/WeatherHistory';
import EvacDetail from './pages/EvacDetail';
import MyRequests from './pages/MyRequests';
import EditProfile from './pages/EditProfile';
import Directory from './pages/Directory';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user } = useApp();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { user } = useApp();

  // Body classes gate the desktop shell + role-specific CSS.
  // Done in an effect so rendering stays side-effect free.
  useEffect(() => {
    if (user) {
      document.body.classList.add('authed');
      document.body.classList.toggle('role-official', user.role === 'official');
    } else {
      document.body.classList.remove('authed', 'role-official');
    }
  }, [user]);

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/resource/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
        <Route path="/thread/:id" element={<ProtectedRoute><MessageThread /></ProtectedRoute>} />
        <Route path="/weather-history" element={<ProtectedRoute><WeatherHistory /></ProtectedRoute>} />
        <Route path="/evac/:id" element={<ProtectedRoute><EvacDetail /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/approvals" element={<ProtectedRoute adminOnly><AdminApprovals /></ProtectedRoute>} />
        <Route path="/admin/puroks" element={<ProtectedRoute adminOnly><AdminPuroks /></ProtectedRoute>} />
        <Route path="/admin/evac" element={<ProtectedRoute adminOnly><AdminEvac /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
