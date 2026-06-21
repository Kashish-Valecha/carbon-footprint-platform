import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Earth } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone_number: '', password: '', city: '', country: '' });
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setUserId(data.userId);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      // Auto login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        login(loginData.token, loginData.user);
        navigate('/');
      } else {
        navigate('/login');
      }
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
          <h1 className="text-2xl font-bold tracking-tight">Join EcoSense</h1>
          <p className="text-sm text-slate-500 mt-1">Start your journey to zero carbon.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="fullName" className="sr-only">Full Name</label>
                <input id="fullName" required aria-required="true" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input id="email" type="email" required aria-required="true" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label htmlFor="password" className="sr-only">Password</label>
                <input id="password" type="password" required aria-required="true" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="city" className="sr-only">City</label>
                <input id="city" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label htmlFor="country" className="sr-only">Country</label>
                <input id="country" placeholder="Country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} aria-busy={loading} aria-disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 text-black font-bold py-3 rounded-xl transition-colors mt-4">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account? <Link to="/login" className="text-emerald-400 font-bold">Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 text-center">
            <p className="text-sm text-slate-300 mb-4">We've sent a 6-digit code to {formData.email}. Note: For hackathon use "123456"</p>
            <label htmlFor="otpCode" className="sr-only">Enter 6-digit OTP</label>
            <input 
              id="otpCode"
              required 
              aria-required="true"
              placeholder="Enter 6-digit OTP" 
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value)} 
              className="w-full bg-[#1a1a1a] border border-slate-800 rounded-xl p-4 text-center text-2xl tracking-widest font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none" 
            />
            <button type="submit" disabled={loading} aria-busy={loading} aria-disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] focus:ring-emerald-500 text-black font-bold py-3 rounded-xl transition-colors mt-4">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
