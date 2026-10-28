import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ResourceProvider } from './context/ResourceContext';
import { PurokProvider } from './context/PurokContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import Inbox from './pages/Inbox';
import WeatherHistory from './pages/WeatherHistory';
import EvacDetail from './pages/EvacDetail';
import MyRequests from './pages/MyRequests';
import EditProfile from './pages/EditProfile';
import Directory from './pages/Directory';
import HouseholdSetup from './pages/EditHousehold';
import './index.css';
import { EvacProvider } from './context/EvacContext';
import { MessagesProvider } from './context/MessagesContext';

function ProtectedRoute({ children, adminOnly = false, allowNoHousehold = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />;
  if (user.role === 'resident' && !user.household && !allowNoHousehold)
    return <Navigate to="/household-setup" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  // Add authenticated class to body
  if (user) {
    document.body.classList.add('authed');
    if (user.role === 'official') {
      document.body.classList.add('role-official');
    } else {
      document.body.classList.remove('role-official');
    }
  } else {
    document.body.classList.remove('authed', 'role-official');
  }

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
        <Route path="/messages" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
        <Route path="/thread/:id" element={<ProtectedRoute><MessageThread /></ProtectedRoute>} />
        <Route path="/weather-history" element={<ProtectedRoute><WeatherHistory /></ProtectedRoute>} />
        <Route path="/evac/:id" element={<ProtectedRoute><EvacDetail /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        <Route path="/household-setup" element={<ProtectedRoute allowNoHousehold><HouseholdSetup /></ProtectedRoute>} />

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MessagesProvider>
        <PurokProvider>
          <EvacProvider>
            <ResourceProvider>
              <AppProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </AppProvider>
            </ResourceProvider>
          </EvacProvider>
        </PurokProvider>
      </MessagesProvider>
    </AuthProvider>
  </StrictMode> 
);