import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import DailyStreakPage from './pages/DailyStreak/DailyStreakPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/daily-streak"
        element={
          <ProtectedRoute>
            <DailyStreakPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/daily-streak" replace />} />
    </Routes>
  );
}
