import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SchedulePage from "./pages/SchedulePage";
import NotFoundPage from "./pages/NotFoundPage";
import InterviewPage from "./pages/InterviewPage1";
import CandidateInterviewPage from "./pages/CandidateInterviewPage";
import InterviewerPage from "./pages/InterviewerPage";

// Components
import InterviewerView from "./components/InterviewerView";
import CandidateView from "./components/CandidateView";
import InterviewerDashboard from "./components/InterviewerDashboard";

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ✅ Role-based Route Component
const RoleRoute = ({ roles, children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user && roles.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 🔒 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/candidate"
            element={
              <ProtectedRoute>
                <CandidateView roomId={1234} />
              </ProtectedRoute>
            }
          />

          {/* 🎯 Role-Based Routes */}
          <Route
            path="/interviewer"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["interviewer", "admin"]}>
                  <InterviewerView roomId={1234} />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviewer-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["interviewer", "admin"]}>
                  <InterviewerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💻 Dynamic Routes for Interviews */}
          <Route
            path="/interview/:roomId"
            element={
              <ProtectedRoute allowedRoles={['interviewer', 'candidate']}>
                <InterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/:roomId"
            element={
              <ProtectedRoute>
                <InterviewPage isInterviewer={true} />
              </ProtectedRoute>
            }
          />

          {/* ❌ 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
