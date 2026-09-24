import { useAuth } from '../../context/AuthContext';

// Full implementation (hero, stats, reward grid, claim flow, countdown)
// arrives in Phase 3. This placeholder confirms auth + routing work end to end.
export default function DailyStreakPage() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h1>Welcome, {user?.name} 👋</h1>
      <p>Daily Streak UI builds here in Phase 3.</p>
      <button onClick={logout} className="btn btn-outline-light">
        Log out
      </button>
    </div>
  );
}
