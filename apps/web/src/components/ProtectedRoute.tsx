/* eslint-disable react-refresh/only-export-components */
import { Outlet, redirect } from 'react-router';
import { useAuthStore } from '../store/authStore';

export async function protectedRouteLoader() {
  const user = await useAuthStore.getState().checkAuth();
  if (!user) {
    throw redirect('/login');
  }
  return user;
}

export default function ProtectedRoute() {
  return <Outlet />;
}