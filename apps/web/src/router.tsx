import { createBrowserRouter, redirect } from 'react-router';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { protectedRouteLoader } from './components/ProtectedRoute';
import AdminGuard, { adminGuardLoader } from './components/AdminGuard';
import { Outlet } from 'react-router';
import { useAuthStore } from './store/authStore';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    loader: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        return redirect('/dashboard');
      }
      return null;
    },
  },
  {
    path: '/',
    element: <Layout />,
    loader: protectedRouteLoader,
    children: [
      {
        index: true,
        loader: () => redirect('/dashboard'),
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: protectedRouteLoader,
      },
      {
        path: 'admin',
        element: <AdminGuard />,
        loader: adminGuardLoader,
        children: [
          {
            path: '*',
            element: <Outlet />,
          },
        ],
      },
    ],
  },
]);