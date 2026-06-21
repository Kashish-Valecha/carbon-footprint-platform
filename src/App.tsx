import { Earth, Leaf, Navigation, Utensils, History, CheckCircle2, User as UserIcon, Trophy, LogOut } from 'lucide-react';
import { Route, BrowserRouter as Router, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TripChecker from './pages/TripChecker';
import FoodChecker from './pages/FoodChecker';
import DailyLog from './pages/DailyLog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import HistoryPage from './pages/HistoryPage';
import { AuthProvider, useAuth } from './components/AuthContext';

function NavigationBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  if (['/login', '/register'].includes(location.pathname)) return null;

  const isActive = (path: string) => location.pathname === path ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1' : 'text-slate-400 hover:text-white transition-colors';

  return (
    <nav className="bg-[#0a0a0a] border-b border-slate-800/50 p-6 pt-4 pb-4" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link to="/" className="flex flex-col focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-lg outline-none">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-emerald-400">
            <Earth className="h-6 w-6 text-emerald-500" role="img" aria-hidden="true" />
            EcoSense
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold ml-8">Know before you go</span>
        </Link>
        {user ? (
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs font-bold uppercase tracking-widest">
            <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined} className={`flex items-center gap-1 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/')}`}><Leaf className="h-4 w-4" aria-hidden="true" /> Dashboard</Link>
            <Link to="/trip" aria-current={location.pathname === '/trip' ? 'page' : undefined} className={`flex items-center gap-1 hidden sm:flex focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/trip')}`}><Navigation className="h-4 w-4" aria-hidden="true" /> Trip</Link>
            <Link to="/food" aria-current={location.pathname === '/food' ? 'page' : undefined} className={`flex items-center gap-1 hidden sm:flex focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/food')}`}><Utensils className="h-4 w-4" aria-hidden="true" /> Food</Link>
            <Link to="/log" aria-current={location.pathname === '/log' ? 'page' : undefined} className={`flex items-center gap-1 hidden sm:flex focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/log')}`}><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Log</Link>
            <Link to="/history" aria-current={location.pathname === '/history' ? 'page' : undefined} className={`flex items-center gap-1 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/history')}`}><History className="h-4 w-4" aria-hidden="true" /> History</Link>
            <Link to="/leaderboard" aria-current={location.pathname === '/leaderboard' ? 'page' : undefined} className={`flex items-center gap-1 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/leaderboard')}`}><Trophy className="h-4 w-4" aria-hidden="true" /> Leaders</Link>
            <Link to="/profile" aria-current={location.pathname === '/profile' ? 'page' : undefined} className={`flex items-center gap-1 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none ${isActive('/profile')}`}><UserIcon className="h-4 w-4" aria-hidden="true" /> Profile</Link>
            <button onClick={logout} aria-label="Sign out" className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors ml-auto md:ml-0 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none"><LogOut className="h-4 w-4" aria-hidden="true" /> Exit</button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-emerald-400 font-bold text-sm uppercase tracking-widest focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md outline-none">Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-emerald-500/30">
          <NavigationBar />
          <main id="main-content" className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 outline-none" tabIndex={-1}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/trip" element={<ProtectedRoute><TripChecker /></ProtectedRoute>} />
              <Route path="/food" element={<ProtectedRoute><FoodChecker /></ProtectedRoute>} />
              <Route path="/log" element={<ProtectedRoute><DailyLog /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
