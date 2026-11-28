import { Route, Routes } from 'react-router-dom';
import GuestRoute from './components/GuestRoute';
import RequireRole from './components/RequireRole';
import AppLayout from './components/app/AppLayout';
import { adminNav, clientNav } from './components/app/navConfig';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    // Routes looks at the URL and shows only the first Route that matches.
    <Routes>
      {/* "/" is the public landing page. */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      {/* Routes without a path only wrap their children: first the guard,
          then the shell with the sidebar and top bar. */}
      <Route element={<RequireRole role="client" />}>
        <Route element={<AppLayout nav={clientNav} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route element={<RequireRole role="admin" />}>
        <Route element={<AppLayout nav={adminNav} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
