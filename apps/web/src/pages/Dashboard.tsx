import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, {user?.username}.</p>
    </div>
  );
}
