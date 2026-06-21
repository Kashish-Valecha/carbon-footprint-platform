import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Earth } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#111] border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Earth className="h-10 w-10 text-emerald-500 mb-2" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome back to EcoSense</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to track your green impact.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email</label>
            <input 
              id="email"
              type="email" 
              required
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Password</label>
            <input 
              id="password"
              type="password" 
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
