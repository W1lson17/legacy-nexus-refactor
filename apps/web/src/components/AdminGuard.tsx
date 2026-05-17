/* eslint-disable react-refresh/only-export-components */
import { Outlet, redirect } from 'react-router';
import { useAuthStore } from '../store/authStore';

export async function adminGuardLoader() {
  const { user } = useAuthStore.getState();
  if (!user?.isAdmin) {
    throw redirect('/');
  }
  return user;
}

export default function AdminGuard() {
  return <Outlet />;
}